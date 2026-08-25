/**
 * Conflict & Consistency Detector — conflict.detector.js
 *
 * Derived architectural validation engine.
 *
 * ARCHITECTURAL PRINCIPLE
 * ───────────────────────
 * Conflicts are NOT raw primary facts. They are DERIVED FINDINGS computed
 * by comparing multiple evidence facts (e.g. Spec vs Implementation, Code vs Env).
 *
 * FINDING TYPES
 * ─────────────
 * 1. contract_mismatch: Discrepancy between OpenAPI/Proto specs and implemented routes.
 * 2. environment_drift: Code accesses environment variables missing from .env.example.
 * 3. unresolved_service_target: Service call directed at an undeclared service.
 */

import * as Fact from "./fact.schema.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects contract, environment, and relationship inconsistencies across facts.
 *
 * @param {Array<Fact>} normalizedFacts
 * @param {ArchitectureGraph} graph
 * @returns {Array<{
 *   id: string,
 *   category: string,
 *   title: string,
 *   description: string,
 *   expected: string,
 *   actual: string,
 *   severity: "warning" | "error" | "info",
 *   evidenceFactIds: string[],
 * }>}
 */
export const detectConflicts = (normalizedFacts = [], graph = null) => {
    const findings = [];

    // ── 1. Contract & Specification Conflicts ─────────────────────────────────
    const allEndpoints = Fact.getEndpoints(normalizedFacts);
    const specEndpoints = allEndpoints.filter(e => e.source?.sourceType === "spec" || e.sourceReliability === Fact.SourceReliability.SPEC);
    const codeEndpoints = allEndpoints.filter(e => e.source?.sourceType !== "spec" && e.sourceReliability !== Fact.SourceReliability.SPEC);

    if (specEndpoints.length > 0 && codeEndpoints.length > 0) {
        const specFindings = detectSpecVsCodeConflicts(specEndpoints, codeEndpoints);
        findings.push(...specFindings);
    }

    // ── 2. Environment Variable Drift ─────────────────────────────────────────
    const envVars = Fact.getEnvVars(normalizedFacts);
    const envFindings = detectEnvironmentDrift(envVars);
    findings.push(...envFindings);

    // ── 3. Unresolved Service Targets in Architecture Graph ───────────────────
    if (graph) {
        const unresolvedFindings = detectUnresolvedCalls(graph);
        findings.push(...unresolvedFindings);
    }

    return findings;
};

// ─────────────────────────────────────────────────────────────────────────────
// Conflict Checking Rules
// ─────────────────────────────────────────────────────────────────────────────

function detectSpecVsCodeConflicts(specEndpoints, codeEndpoints) {
    const findings = [];
    const codePathMethodSet = new Set(codeEndpoints.map(e => `${e.method}:${normalizePath(e.path)}`));
    const codeBarePaths = new Set(codeEndpoints.map(e => normalizePath(e.path)));

    for (const spec of specEndpoints) {
        const specNormPath = normalizePath(spec.path);
        const specKey = `${spec.method}:${specNormPath}`;

        if (!codePathMethodSet.has(specKey)) {
            // Check for plural/singular mismatches: e.g. /payments vs /payment
            const pluralVariant = specNormPath.endsWith("s") ? specNormPath.slice(0, -1) : `${specNormPath}s`;
            const matchingVariant = Array.from(codeBarePaths).find(p => p === pluralVariant || p === specNormPath);

            if (matchingVariant) {
                const codeMatch = codeEndpoints.find(e => normalizePath(e.path) === matchingVariant);
                findings.push({
                    id: `conflict:spec:${spec.id}`,
                    category: "contract_mismatch",
                    title: `Endpoint Spec & Implementation Mismatch for ${spec.path}`,
                    description: `OpenAPI specification declares ${spec.method} ${spec.path}, but implementation routes differ (${codeMatch ? codeMatch.method + ' ' + codeMatch.path : 'path variation'}).`,
                    expected: `${spec.method} ${spec.path} (declared in OpenAPI spec)`,
                    actual: codeMatch ? `${codeMatch.method} ${codeMatch.path} (implemented in code)` : `Variant ${matchingVariant}`,
                    severity: "warning",
                    evidenceFactIds: [spec.id, codeMatch?.id].filter(Boolean),
                });
            }
        }
    }

    return findings;
}

function detectEnvironmentDrift(envVars) {
    const findings = [];
    const codeVars = envVars.filter(e => e.value?.source === "code" || e.source?.sourceType === "code");
    const fileVarKeys = new Set(envVars.filter(e => e.value?.source === "file" || e.source?.sourceType === "config").map(e => e.key));

    const CRITICAL_KEYWORDS = ["DATABASE", "DB", "REDIS", "SECRET", "KEY", "TOKEN", "AUTH", "API_KEY", "PORT"];

    for (const cv of codeVars) {
        if (fileVarKeys.size > 0 && !fileVarKeys.has(cv.key)) {
            const isCritical = CRITICAL_KEYWORDS.some(k => cv.key.includes(k));
            if (isCritical) {
                findings.push({
                    id: `conflict:env:${cv.id}`,
                    category: "environment_drift",
                    title: `Undeclared Environment Variable: ${cv.key}`,
                    description: `Source code consumes process.env.${cv.key}, but it is not declared in .env.example or configuration files.`,
                    expected: `${cv.key} defined in .env.example`,
                    actual: "Missing from environment sample files",
                    severity: "warning",
                    evidenceFactIds: [cv.id],
                });
            }
        }
    }

    return findings;
}

function detectUnresolvedCalls(graph) {
    const findings = [];
    const nodeIds = new Set(graph.getAllNodes().map(n => n.id));

    for (const edge of graph.getAllEdges()) {
        if (edge.type === "calls" && !nodeIds.has(edge.to)) {
            findings.push({
                id: `conflict:unresolved:${edge.id}`,
                category: "unresolved_service_target",
                title: `Service Call to Unknown Target: ${edge.to}`,
                description: `Component ${edge.from} makes an outbound call to ${edge.to}, which was not discovered in the repository services.`,
                expected: `Service ${edge.to} declared in repository`,
                actual: `Unresolved target ${edge.to}`,
                severity: "info",
                evidenceFactIds: edge.evidenceFactIds || [],
            });
        }
    }

    return findings;
}

function normalizePath(p) {
    return (p || "/").replace(/\{[^}]+\}/g, ":param").replace(/:[a-zA-Z0-9_]+/g, ":param").replace(/\/+/g, "/").toLowerCase();
}
