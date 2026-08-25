/**
 * Repository Analyzer — repository.analyzer.js (V2 — Pluggable Polyglot Orchestrator)
 *
 * ARCHITECTURE
 * ────────────
 * This orchestrator implements the pluggable, evidence-driven architecture:
 *
 *   Repository
 *        │
 *        ▼
 *   Service Detector   ← Detects monorepo topology
 *        │
 *        ▼
 *   Per-service loop:
 *     ├── Manifest Analyzer    ← Detects ecosystem, reads dependencies
 *     ├── Infrastructure Analyzer ← OpenAPI, .env, Docker, K8s, proto
 *     └── Language Plugin      ← JS/Python/Java/Go source-level analysis
 *        │
 *        ▼
 *   Common Fact Model          ← All analyzers write the same shape
 *        │
 *        ▼
 *   Feature Analyzer           ← Infers high-level features from facts
 *        │
 *        ▼
 *   Architecture Graph         ← Connects services via servicecall facts
 *        │
 *        ▼
 *   Output knowledge object
 *
 * BACKWARD COMPATIBILITY
 * ──────────────────────
 * The output object preserves the legacy fields (routes, models, controllers,
 * ast, features, package) that repositoryContext.builder.js, facts.extractor.js,
 * prompt.builder.js, and critic.js currently consume. Those consumers require
 * NO changes.
 *
 * New fields (ecosystem, isMonorepo, services, facts) are additive — they
 * enrich the AI context without breaking anything.
 *
 * PLUGIN REGISTRY
 * ───────────────
 * Plugins are tried in priority order. The first plugin whose detect() returns
 * true is used. The GenericPlugin (last in the list) always returns true and
 * serves as a graceful fallback for unsupported languages.
 */

import * as packageAnalyzer        from "./package.analyzer.js";
import * as featureAnalyzer        from "./feature.analyzer.js";
import * as serviceDetector        from "./core/service.detector.js";
import * as infraAnalyzer          from "./core/infrastructure.analyzer.js";
import * as Fact                   from "./core/fact.schema.js";
import { normalizeFacts }          from "./core/fact.normalizer.js";
import { resolveRelationships }    from "./core/relationship.resolver.js";
import { detectConflicts }         from "./core/conflict.detector.js";

// Language plugins (priority order — highest confidence first)
import jsPlugin                    from "./plugins/javascript/index.js";
import pythonPlugin                from "./plugins/python/index.js";
import javaPlugin                  from "./plugins/java/index.js";
import goPlugin                    from "./plugins/go/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// Generic / fallback plugin
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Graceful fallback for languages with no specific plugin.
 * Produces zero source-level facts but does not throw.
 * The AI still receives manifest + infrastructure facts.
 */
const GENERIC_PLUGIN = {
    name:       () => "Generic (manifest + infrastructure only)",
    confidence: () => "low",
    detect:     ()  => true, // always matches
    analyze:    ()  => ({ facts: [], parseErrors: [] }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin Registry
// ─────────────────────────────────────────────────────────────────────────────

// Plugins are tested in this order. First match wins.
// To add a new language: import your plugin and push it before GENERIC_PLUGIN.
const PLUGIN_REGISTRY = [
    jsPlugin,
    pythonPlugin,
    javaPlugin,
    goPlugin,
    // Future: rustPlugin, phpPlugin, rubyPlugin, dotnetPlugin, elixirPlugin
    GENERIC_PLUGIN,
];

// ─────────────────────────────────────────────────────────────────────────────
// Project type detection (ecosystem-aware)
// ─────────────────────────────────────────────────────────────────────────────

const FRONTEND_FRAMEWORKS = new Set([
    "React", "Vue", "Angular", "Svelte", "SvelteKit", "SolidJS",
    "Preact", "Remix", "Astro", "Qwik", "Next.js", "Nuxt",
]);

const BACKEND_FRAMEWORKS = new Set([
    "Express", "Fastify", "Koa", "Hapi", "NestJS", "Restify", "Hono", "Elysia", "Polka",
    "Django", "FastAPI", "Flask", "Spring Boot", "Spring WebFlux",
    "Quarkus", "Micronaut", "Gin", "Echo", "Fiber", "Chi",
    "Actix Web", "Axum", "Rocket", "Laravel", "Symfony",
    "Ruby on Rails", "Sinatra", "ASP.NET Core", "Phoenix",
    "Dart Frog", "Serverpod",
]);

function detectProjectType(allFiles, packageInfo, facts) {
    if (!packageInfo) return "backend";

    const frameworkList = packageInfo.technology.frameworks || [];
    const hasFrontend   = frameworkList.some(f => FRONTEND_FRAMEWORKS.has(f));
    const hasBackend    = frameworkList.some(f => BACKEND_FRAMEWORKS.has(f));

    // Endpoints in facts are also a strong backend signal
    const hasEndpointFacts = facts.some(f => f.type === "endpoint");

    const hasServerFile = allFiles.some(f =>
        ["server.js", "app.js", "index.js", "main.py", "app.py",
         "main.go", "main.rs", "Application.java"].includes(
            f.path.replace(/\\/g, "/").split("/").pop()
        )
    );

    if (hasFrontend && (hasBackend || hasServerFile || hasEndpointFacts)) return "fullstack";
    if (hasFrontend) return "frontend";
    return "backend";
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const analyzeRepository = (repository) => {

    const allFiles = repository.files || [];

    // ── 1. Service topology detection ─────────────────────────────────────────
    const topology = serviceDetector.detectServices(allFiles);

    // ── 2. Root Infrastructure Analysis (OpenAPI specs, docker-compose, root .env) ──
    const allFacts       = [];
    const allParseErrors = [];
    const enrichedServices = [];

    // Analyze root-level files (files not in sub-services or root contracts)
    const rootInfraFacts = infraAnalyzer.analyzeInfrastructure(allFiles, null);
    allFacts.push(...rootInfraFacts);

    // ── 3. Analyze each service ───────────────────────────────────────────────
    let legacyAst         = { apiCalls: [], expressRoutes: [], envVars: [], envFileVars: [], parseErrors: [], filesAnalyzed: 0, filesFailed: 0 };
    let legacyRoutes      = [];
    let legacyModels      = [];
    let legacyControllers = [];
    let primaryPackageInfo = null;

    for (const svc of topology.services) {

        // Get files belonging to this service
        const serviceFiles = serviceDetector.getServiceFiles(svc, allFiles);

        // Manifest analysis
        const manifestInfo = packageAnalyzer.analyzePackage({ files: serviceFiles });
        if (!primaryPackageInfo) primaryPackageInfo = manifestInfo;

        // Enrich service fact with ecosystem/language from manifest
        const enrichedSvc = Fact.service({
            name:          svc.value?.name || svc.name,
            path:          svc.value?.path || svc.path,
            componentType: svc.value?.componentType || svc.componentType || "service",
            ecosystem:     manifestInfo?.ecosystem || svc.value?.ecosystem || svc.ecosystem || "unknown",
            language:      manifestInfo?.technology?.language || svc.value?.language || svc.language || "Unknown",
            framework:     manifestInfo?.technology?.framework || null,
            confidence:    svc.confidence,
            evidence:      svc.evidence,
        });
        enrichedServices.push(enrichedSvc);

        // Infrastructure analysis (always runs regardless of ecosystem)
        const infraFacts = infraAnalyzer.analyzeInfrastructure(serviceFiles, svc.name);
        allFacts.push(...infraFacts);

        // Language plugin dispatch
        const plugin = PLUGIN_REGISTRY.find(p => p.detect(serviceFiles, manifestInfo));
        const pluginResult = plugin.analyze(serviceFiles, manifestInfo, svc.name === "." ? null : svc.name);
        allFacts.push(...(pluginResult.facts || []));
        allParseErrors.push(...(pluginResult.parseErrors || []));

        // Capture legacy objects from the JavaScript plugin for backward compat
        if (pluginResult._legacy) {
            legacyAst         = pluginResult._legacy.ast         || legacyAst;
            legacyRoutes      = pluginResult._legacy.routes      || legacyRoutes;
            legacyModels      = pluginResult._legacy.models      || legacyModels;
            legacyControllers = pluginResult._legacy.controllers || legacyControllers;
        }

        // Dependency facts from manifest
        for (const dep of manifestInfo?.runtimeDependencies || []) {
            allFacts.push(Fact.dependency({
                name:    dep,
                service: svc.name,
                isDev:   false,
                confidence: Fact.Confidence.SPEC,
            }));
        }

        // Datastore facts from manifest (works across all ecosystems)
        for (const db of manifestInfo?.technology?.database || []) {
            allFacts.push(Fact.datastore({
                technology: db,
                service:    svc.name === "." ? null : svc.name,
                confidence: Fact.Confidence.SPEC,
                evidence:   ["Manifest dependency classification"],
            }));
        }
    }

    // ── 3. Project type detection ─────────────────────────────────────────────
    const projectType = detectProjectType(allFiles, primaryPackageInfo, allFacts);

    // ── 4. Feature inference ──────────────────────────────────────────────────
    // Feature analyzer still uses the normalized packageInfo + legacy shapes.
    // This preserves the existing feature detection logic.
    const features = featureAnalyzer.analyzeFeatures({
        projectType,
        package:     primaryPackageInfo,
        routes:      legacyRoutes,
        models:      legacyModels,
        controllers: legacyControllers,
        ast:         legacyAst,
    });

    // ── 5. Fact Normalization ────────────────────────────────────────────────
    const normalizedFacts = normalizeFacts(allFacts);

    // ── 6. Architecture Graph Construction ───────────────────────────────────
    const architectureGraph = resolveRelationships(enrichedServices, normalizedFacts);

    // ── 7. Conflict & Consistency Detection ───────────────────────────────────
    const conflicts = detectConflicts(normalizedFacts, architectureGraph);

    // ── 8. Assemble output ────────────────────────────────────────────────────
    return {

        // ── Canonical Architecture Model ─────────────────────────────────────
        isMonorepo:        topology.isMonorepo,
        services:          enrichedServices,
        facts:             normalizedFacts,
        architectureGraph,
        conflicts,

        // ── Primary ecosystem (first/only service) ───────────────────────────
        ecosystem:    primaryPackageInfo?.ecosystem || "unknown",

        // ── Legacy fields (preserved for backward compatibility) ─────────────
        // repositoryContext.builder.js, facts.extractor.js, prompt.builder.js,
        // critic.js, and diagram.graph.js all read these directly.
        projectType,
        package:      primaryPackageInfo,
        routes:       legacyRoutes,
        models:       legacyModels,
        controllers:  legacyControllers,
        features,
        ast:          legacyAst,
        folders:      null,
        readme:       null,

        // Analysis stats — surfaced in logs and the console UI
        analysisStats: {
            isMonorepo:     topology.isMonorepo,
            serviceCount:   enrichedServices.length,
            ecosystems:     [...new Set(enrichedServices.map(s => s.ecosystem))],
            factCount:      allFacts.length,
            endpointCount:  Fact.filterByType(allFacts, "endpoint").length,
            filesAnalyzed:  legacyAst.filesAnalyzed || 0,
            filesFailed:    legacyAst.filesFailed   || 0,
            routesParsed:   legacyRoutes.length,
            modelsParsed:   legacyModels.length,
            parseErrors:    allParseErrors,
            detectionEvidence: topology.evidence,
        },

    };

};