/**
 * JavaScript / TypeScript Plugin — plugins/javascript/index.js
 *
 * Adapter that wraps PushDoc's existing high-confidence analyzers
 * (Babel AST, route scanner, model extractor, controller extractor)
 * and normalizes their output into Common Fact Model objects.
 *
 * This plugin does NOT change any analyzer logic. It is a pure translation
 * layer — the analyzers that were built and battle-tested for Express/NestJS
 * continue to work exactly as before. Their output is simply converted to
 * Fact.endpoint / Fact.datastore / Fact.envvar objects here.
 *
 * CONFIDENCE: "high" — Babel AST-based route and model extraction
 */

import { AnalyzerPlugin } from "../../core/analyzer.interface.js";
import * as Fact           from "../../core/fact.schema.js";
import * as astAnalyzer    from "../../ast.analyzer.js";
import * as routeAnalyzer  from "../../route.analyzer.js";
import * as modelAnalyzer  from "../../model.analyzer.js";
import * as controllerAnalyzer from "../../controller.analyzer.js";

// JS/TS source file extensions
const JS_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

export class JavaScriptPlugin extends AnalyzerPlugin {

    name()       { return "JavaScript/TypeScript (Babel AST)"; }
    confidence() { return "high"; }

    getCapabilities() {
        return {
            languages: ["javascript", "typescript"],
            frameworks: ["express", "nest", "koa", "fastify", "next"],
            produces: ["endpoint", "datastore", "envvar", "servicecall"],
        };
    }

    detect(serviceFiles, manifestInfo) {
        const ecosystem = manifestInfo?.ecosystem;
        if (ecosystem === "nodejs") return true;

        // Fallback: check for JS/TS source files
        return serviceFiles.some(f => JS_EXTENSIONS.has((f.extension || "").toLowerCase()));
    }

    analyze(serviceFiles, manifestInfo, serviceName) {
        const facts       = [];
        const parseErrors = [];
        const svc         = serviceName || null;

        const repository  = { files: serviceFiles };

        // ── 1. AST analysis (API calls, env vars, Express route aliases) ──────
        let ast = { apiCalls: [], expressRoutes: [], envVars: [], envFileVars: [], parseErrors: [] };
        try {
            ast = astAnalyzer.analyzeAst(repository);
            parseErrors.push(...(ast.parseErrors || []));
        } catch (err) {
            parseErrors.push({ file: "ast.analyzer", error: err.message });
        }

        // Convert AST-found env vars
        for (const key of ast.envVars || []) {
            facts.push(Fact.envvar({ key, source: "code", service: svc, confidence: Fact.Confidence.AST }));
        }
        for (const ev of ast.envFileVars || []) {
            facts.push(Fact.envvar({ key: ev.key, source: "file", service: svc, confidence: Fact.Confidence.SPEC }));
        }

        // Convert AST-found axios/fetch calls (service-to-service calls)
        for (const call of ast.apiCalls || []) {
            facts.push(Fact.servicecall({
                from:       svc,
                url:        call.url,
                method:     call.method || "GET",
                file:       call.file,
                line:       call.line,
                confidence: Fact.Confidence.AST,
                evidence:   [`${call.client} call in ${call.file}`],
            }));
        }

        // ── 2. Route analysis (Express route scanner) ─────────────────────────
        let routes = [];
        try {
            routes = routeAnalyzer.analyzeRoutes(repository);
            const routeErrors = routeAnalyzer.analyzeRoutes._lastParseErrors || [];
            parseErrors.push(...routeErrors);
        } catch (err) {
            parseErrors.push({ file: "route.analyzer", error: err.message });
        }

        for (const route of routes) {
            facts.push(Fact.fromLegacyRoute(route, svc));
        }

        // ── 3. Model analysis (Mongoose/Sequelize/Prisma schema extraction) ────
        let models = [];
        try {
            models = modelAnalyzer.analyzeModels(repository);
        } catch (err) {
            parseErrors.push({ file: "model.analyzer", error: err.message });
        }

        // Detect database technology from manifest info
        const dbTechs = manifestInfo?.technology?.database || [];
        const primaryDb = dbTechs[0] || "Database";

        for (const model of models) {
            facts.push(Fact.fromLegacyModel(model, primaryDb, svc));
        }

        // ── 4. Controller analysis (operation detection) ───────────────────────
        let controllers = [];
        try {
            controllers = controllerAnalyzer.analyzeControllers(repository);
        } catch (err) {
            parseErrors.push({ file: "controller.analyzer", error: err.message });
        }

        return {
            facts,
            parseErrors,
            // Pass through legacy-shaped data for backward compat
            _legacy: { ast, routes, models, controllers },
        };
    }
}

export default new JavaScriptPlugin();
