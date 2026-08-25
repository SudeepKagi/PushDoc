/**
 * Fact Normalizer — fact.normalizer.js (V1)
 *
 * Sits between the raw analyzer outputs and the Relationship Resolver.
 * Ensures consistent canonical formatting for paths, HTTP methods, datastore
 * technology names, and environment variables across all languages and specs.
 *
 * WHY THIS MATTERS
 * ────────────────
 * 1. Express uses `/users/:id`, FastAPI uses `/users/{id}`, and Spring uses `/users/{id}`.
 *    Without normalization, cross-contract comparisons and correlation fail.
 * 2. `POST`, `post`, and `Post` are normalized to `POST`.
 * 3. Trailing slashes `/users/` and `/users` are normalized to `/users`.
 * 4. Datastores like `PostgreSQL (SQLAlchemy)` and `postgres` are mapped to canonical `PostgreSQL`.
 */

import * as Fact from "./fact.schema.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes an array of raw facts into canonical representation.
 *
 * @param {Array<Fact>} facts
 * @returns {Array<Fact>} normalizedFacts
 */
export const normalizeFacts = (facts = []) => {
    if (!Array.isArray(facts)) return [];

    return facts.map(fact => {
        if (!fact || !fact.type) return fact;

        switch (fact.type) {
            case "endpoint":
                return normalizeEndpointFact(fact);
            case "datastore":
                return normalizeDatastoreFact(fact);
            case "envvar":
                return normalizeEnvVarFact(fact);
            case "servicecall":
                return normalizeServiceCallFact(fact);
            default:
                return fact;
        }
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeEndpointFact(fact) {
    const rawPath = fact.value?.path || fact.path || "/";
    const rawMethod = fact.value?.method || fact.method || "GET";

    const normalizedPath = normalizeUrlPath(rawPath);
    const normalizedMethod = rawMethod.toUpperCase().trim();

    return Fact.endpoint({
        id: fact.id,
        method: normalizedMethod,
        path: normalizedPath,
        handler: fact.value?.handler || fact.handler || null,
        params: fact.value?.params || fact.params || [],
        service: fact.source?.service || fact.service,
        file: fact.source?.file || fact.file,
        line: fact.source?.line || fact.line,
        sourceType: fact.source?.sourceType || fact.sourceType || "code",
        analyzer: fact.source?.analyzer || fact.analyzer,
        sourceReliability: fact.sourceReliability,
        confidence: fact.confidence,
        evidence: fact.evidence,
    });
}

function normalizeDatastoreFact(fact) {
    const rawTech = fact.value?.technology || fact.technology || "Unknown";
    const { canonical, dialect } = normalizeDatastoreTechnology(rawTech);

    return Fact.datastore({
        id: fact.id,
        technology: canonical,
        entities: fact.value?.entities || fact.entities || [],
        service: fact.source?.service || fact.service,
        file: fact.source?.file || fact.file,
        line: fact.source?.line || fact.line,
        sourceType: fact.source?.sourceType || fact.sourceType || "code",
        analyzer: fact.source?.analyzer || fact.analyzer,
        sourceReliability: fact.sourceReliability,
        confidence: fact.confidence,
        evidence: [
            ...(fact.evidence || []),
            dialect ? `Dialect / Driver: ${dialect}` : null,
        ].filter(Boolean),
    });
}

function normalizeEnvVarFact(fact) {
    const rawKey = fact.value?.key || fact.key || "";
    const cleanKey = rawKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    return Fact.envvar({
        id: fact.id,
        key: cleanKey,
        source: fact.value?.source || fact.source || "code",
        defaultValue: fact.value?.defaultValue,
        service: fact.source?.service || fact.service,
        file: fact.source?.file || fact.file,
        line: fact.source?.line || fact.line,
        analyzer: fact.source?.analyzer || fact.analyzer,
        sourceReliability: fact.sourceReliability,
        confidence: fact.confidence,
        evidence: fact.evidence,
    });
}

function normalizeServiceCallFact(fact) {
    const rawPath = fact.value?.path || fact.path;
    const rawMethod = fact.value?.method || fact.method || "GET";

    return Fact.servicecall({
        id: fact.id,
        from: fact.source?.service || fact.from,
        to: fact.value?.to || fact.to,
        url: fact.value?.url || fact.url,
        method: rawMethod.toUpperCase().trim(),
        path: rawPath ? normalizeUrlPath(rawPath) : null,
        protocol: fact.value?.protocol || fact.protocol || "HTTP",
        file: fact.source?.file || fact.file,
        line: fact.source?.line || fact.line,
        analyzer: fact.source?.analyzer || fact.analyzer,
        sourceReliability: fact.sourceReliability,
        confidence: fact.confidence,
        evidence: fact.evidence,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical Path & String Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeUrlPath(path) {
    if (!path || path === "/" || path === "") return "/";

    let p = String(path).trim();
    if (!p.startsWith("/")) p = "/" + p;

    // Convert parameter syntax: /users/{id} or /users/<int:id> -> /users/:id
    p = p.replace(/\{([a-zA-Z0-9_]+)\}/g, ":$1");
    p = p.replace(/<(?:\w+:)?([a-zA-Z0-9_]+)>/g, ":$1");

    // Remove duplicate slashes
    p = p.replace(/\/+/g, "/");

    // Strip trailing slash unless it's just "/"
    if (p.length > 1 && p.endsWith("/")) {
        p = p.slice(0, -1);
    }

    return p;
}

export function normalizeDatastoreTechnology(tech) {
    const t = String(tech).trim();

    if (/postgres|psycopg|pg/i.test(t)) {
        return { canonical: "PostgreSQL", dialect: extractDialect(t) };
    }
    if (/mongo/i.test(t)) {
        return { canonical: "MongoDB", dialect: extractDialect(t) };
    }
    if (/mysql|mariadb/i.test(t)) {
        return { canonical: "MySQL", dialect: extractDialect(t) };
    }
    if (/redis/i.test(t)) {
        return { canonical: "Redis", dialect: extractDialect(t) };
    }
    if (/sqlite/i.test(t)) {
        return { canonical: "SQLite", dialect: extractDialect(t) };
    }
    if (/elastic/i.test(t)) {
        return { canonical: "Elasticsearch", dialect: null };
    }

    return { canonical: t, dialect: null };
}

function extractDialect(str) {
    const match = str.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
}
