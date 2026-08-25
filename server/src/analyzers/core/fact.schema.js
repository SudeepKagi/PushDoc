/**
 * Common Fact Model — fact.schema.js (Production V6)
 *
 * CANONICAL FACT SHAPE
 * ────────────────────
 * {
 *   id: "endpoint:user-service:GET:/users:a8f2",
 *   type: "endpoint",
 *   value: { method: "GET", path: "/users", handler: "getUsers", params: [] },
 *   source: {
 *     service: "user-service",
 *     file: "src/routes/user.js",
 *     line: 24,
 *     sourceType: "ast",
 *     analyzer: "express-route-analyzer"
 *   },
 *   sourceReliability: 0.95,
 *   confidence: 0.98,
 *   evidence: ["Express router.get() AST node at src/routes/user.js:24"]
 * }
 *
 * CORE PRINCIPLES
 * ───────────────
 * 1. Source Reliability vs Confidence:
 *    • sourceReliability: How trustworthy is this type of evidence (SPEC=0.99, AST=0.95, REGEX=0.75).
 *    • confidence: How confident the specific analyzer is in this individual fact extraction.
 * 2. Deterministic & Collision-Safe IDs:
 *    • Composed of type, service, normalized key, and an optional source location hash.
 * 3. Traceability:
 *    • Every fact identifies the exact producing analyzer (`source.analyzer`), file, and line.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Source Reliability Levels
// ─────────────────────────────────────────────────────────────────────────────

export const SourceReliability = Object.freeze({
    SPEC:       0.99, // Explicit contract: OpenAPI, AsyncAPI, GraphQL schema, Proto
    AST:        0.95, // Deterministic AST parse (Babel, Java parser, etc.)
    CONFIG:     0.90, // Explicit config: docker-compose.yml, k8s manifests, application.properties
    MANIFEST:   0.88, // Package manifests: package.json, pom.xml, go.mod, Cargo.toml
    REGEX:      0.75, // Text pattern scanning on source code
    HEURISTIC:  0.60, // Directory names, naming conventions
    INFERRED:   0.45, // AI inference or indirect correlation
});

export const Confidence = SourceReliability;

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Fact ID Generator (Collision-Safe)
// ─────────────────────────────────────────────────────────────────────────────

export function generateFactId(type, serviceName, key, sourceLocation = "") {
    const s = (serviceName || "root").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const k = String(key || "").toLowerCase().replace(/[^a-z0-9/_:-]/g, "_");
    
    if (sourceLocation) {
        let hash = 0;
        const str = String(sourceLocation);
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).slice(0, 6);
        return `${type}:${s}:${k}:${hex}`;
    }

    return `${type}:${s}:${k}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Fact Factory
// ─────────────────────────────────────────────────────────────────────────────

function createFact({
    id,
    type,
    value = {},
    source = {},
    sourceReliability = SourceReliability.REGEX,
    confidence = 0.85,
    evidence = [],
}) {
    const factObj = {
        id,
        type,
        value,
        source: {
            service: source.service || null,
            file: source.file || null,
            line: source.line || null,
            sourceType: source.sourceType || "code",
            analyzer: source.analyzer || "generic-analyzer",
        },
        sourceReliability,
        confidence,
        evidence: Array.isArray(evidence) ? evidence : [evidence].filter(Boolean),
    };

    // Shorthand backward-compatibility getters
    return Object.defineProperties(factObj, {
        method:     { get() { return this.value.method; }, enumerable: false },
        path:       { get() { return this.value.path; }, enumerable: false },
        handler:    { get() { return this.value.handler; }, enumerable: false },
        technology: { get() { return this.value.technology; }, enumerable: false },
        entities:   { get() { return this.value.entities; }, enumerable: false },
        key:        { get() { return this.value.key; }, enumerable: false },
        name:       { get() { return this.value.name; }, enumerable: false },
        from:       { get() { return this.value.from; }, enumerable: false },
        to:         { get() { return this.value.to; }, enumerable: false },
        url:        { get() { return this.value.url; }, enumerable: false },
        topic:      { get() { return this.value.topic; }, enumerable: false },
        producer:   { get() { return this.value.producer; }, enumerable: false },
        consumer:   { get() { return this.value.consumer; }, enumerable: false },
        broker:     { get() { return this.value.broker; }, enumerable: false },
        service:    { get() { return this.source.service; }, enumerable: false },
        file:       { get() { return this.source.file; }, enumerable: false },
        line:       { get() { return this.source.line; }, enumerable: false },
        analyzer:   { get() { return this.source.analyzer; }, enumerable: false },
        sourceType: { get() { return this.source.sourceType; }, enumerable: false },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed Fact Constructors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An HTTP API endpoint detected in source code or a spec file.
 */
export const endpoint = (opts = {}) => {
    const method = (opts.method || opts.value?.method || "GET").toUpperCase();
    const path = opts.path || opts.value?.path || "/";
    const handler = opts.handler || opts.value?.handler || null;
    const serviceName = opts.service || opts.source?.service || null;
    const file = opts.file || opts.source?.file || null;
    const line = opts.line || opts.source?.line || null;
    const sourceType = opts.sourceType || opts.source?.sourceType || "code";
    const analyzer = opts.analyzer || opts.source?.analyzer || (sourceType === "spec" ? "openapi-parser" : "route-analyzer");

    const id = opts.id || generateFactId("endpoint", serviceName, `${method}:${path}`, file ? `${file}:${line || 0}` : "");

    return createFact({
        id,
        type: "endpoint",
        value: {
            method,
            path,
            handler,
            params: opts.params || opts.value?.params || [],
        },
        source: {
            service: serviceName,
            file,
            line,
            sourceType,
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? (sourceType === "spec" ? SourceReliability.SPEC : SourceReliability.AST),
        confidence: opts.confidence ?? (sourceType === "spec" ? 0.99 : 0.90),
        evidence: opts.evidence || [],
    });
};

/**
 * A data store (database, cache, search engine, object storage) used by a service.
 */
export const datastore = (opts = {}) => {
    const technology = opts.technology || opts.value?.technology || "Unknown";
    const serviceName = opts.service || opts.source?.service || null;
    const entities = opts.entities || opts.value?.entities || [];
    const file = opts.file || opts.source?.file || null;
    const line = opts.line || opts.source?.line || null;
    const sourceType = opts.sourceType || opts.source?.sourceType || "code";
    const analyzer = opts.analyzer || opts.source?.analyzer || "model-analyzer";

    const id = opts.id || generateFactId("datastore", serviceName, technology, file || "");

    return createFact({
        id,
        type: "datastore",
        value: {
            technology,
            entities,
        },
        source: {
            service: serviceName,
            file,
            line,
            sourceType,
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? SourceReliability.CONFIG,
        confidence: opts.confidence ?? SourceReliability.HEURISTIC,
        evidence: opts.evidence || [],
    });
};

/**
 * A logical service/application or library within the repository.
 */
export const service = (opts = {}) => {
    const name = opts.name || opts.value?.name || "unknown";
    const path = opts.path || opts.value?.path || ".";
    const componentType = opts.componentType || opts.value?.componentType || "service";
    const ecosystem = opts.ecosystem || opts.value?.ecosystem || "unknown";
    const language = opts.language || opts.value?.language || "Unknown";
    const framework = opts.framework || opts.value?.framework || null;
    const analyzer = opts.analyzer || opts.source?.analyzer || "service-detector";

    const id = opts.id || generateFactId("service", name, path);

    return createFact({
        id,
        type: "service",
        value: {
            name,
            path,
            componentType,
            ecosystem,
            language,
            framework,
        },
        source: {
            service: name,
            file: path,
            line: null,
            sourceType: "manifest",
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? SourceReliability.MANIFEST,
        confidence: opts.confidence ?? SourceReliability.HEURISTIC,
        evidence: opts.evidence || [],
    });
};

/**
 * An environment variable required or consumed by a service.
 */
export const envvar = (opts = {}) => {
    const key = opts.key || opts.value?.key || "";
    const sourceKind = opts.sourceKind || opts.source || opts.value?.source || "code";
    const serviceName = opts.service || opts.source?.service || null;
    const file = opts.file || opts.source?.file || null;
    const line = opts.line || opts.source?.line || null;
    const analyzer = opts.analyzer || opts.source?.analyzer || (sourceKind === "file" ? "env-file-parser" : "ast-env-analyzer");

    const id = opts.id || generateFactId("envvar", serviceName, key, file || "");

    return createFact({
        id,
        type: "envvar",
        value: {
            key,
            source: sourceKind,
            defaultValue: opts.defaultValue || opts.value?.defaultValue || null,
        },
        source: {
            service: serviceName,
            file,
            line,
            sourceType: sourceKind === "file" ? "config" : "code",
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? (sourceKind === "file" ? SourceReliability.CONFIG : SourceReliability.AST),
        confidence: opts.confidence ?? SourceReliability.AST,
        evidence: opts.evidence || [],
    });
};

/**
 * A package/library dependency.
 */
export const dependency = (opts = {}) => {
    const name = opts.name || opts.value?.name || "";
    const version = opts.version || opts.value?.version || null;
    const category = opts.category || opts.value?.category || "other";
    const isDev = opts.isDev ?? opts.value?.isDev ?? false;
    const serviceName = opts.service || opts.source?.service || null;
    const analyzer = opts.analyzer || opts.source?.analyzer || "package-analyzer";

    const id = opts.id || generateFactId("dependency", serviceName, name);

    return createFact({
        id,
        type: "dependency",
        value: {
            name,
            version,
            category,
            isDev,
        },
        source: {
            service: serviceName,
            file: "manifest",
            line: null,
            sourceType: "manifest",
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? SourceReliability.MANIFEST,
        confidence: opts.confidence ?? SourceReliability.SPEC,
        evidence: opts.evidence || [],
    });
};

/**
 * A detected HTTP or RPC call from one service to another or external API.
 */
export const servicecall = (opts = {}) => {
    const from = opts.from || opts.value?.from || null;
    const to = opts.to || opts.value?.to || null;
    const url = opts.url || opts.value?.url || null;
    const method = (opts.method || opts.value?.method || "GET").toUpperCase();
    const path = opts.path || opts.value?.path || null;
    const protocol = opts.protocol || opts.value?.protocol || "HTTP";
    const file = opts.file || opts.source?.file || null;
    const line = opts.line || opts.source?.line || null;
    const analyzer = opts.analyzer || opts.source?.analyzer || "servicecall-analyzer";

    const id = opts.id || generateFactId("servicecall", from, `${method}:${to || url || path}`, file ? `${file}:${line || 0}` : "");

    return createFact({
        id,
        type: "servicecall",
        value: {
            from,
            to,
            url,
            method,
            path,
            protocol,
        },
        source: {
            service: from,
            file,
            line,
            sourceType: "code",
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? SourceReliability.AST,
        confidence: opts.confidence ?? SourceReliability.REGEX,
        evidence: opts.evidence || [],
    });
};

/**
 * A message-queue event publish or consume flow.
 */
export const event = (opts = {}) => {
    const topic = opts.topic || opts.value?.topic || null;
    const producer = opts.producer || opts.value?.producer || null;
    const consumer = opts.consumer || opts.value?.consumer || null;
    const broker = opts.broker || opts.value?.broker || null;
    const file = opts.file || opts.source?.file || null;
    const line = opts.line || opts.source?.line || null;
    const analyzer = opts.analyzer || opts.source?.analyzer || "event-analyzer";

    const id = opts.id || generateFactId("event", producer || consumer, `${broker}:${topic}`, file || "");

    return createFact({
        id,
        type: "event",
        value: {
            topic,
            producer,
            consumer,
            broker,
        },
        source: {
            service: producer || consumer,
            file,
            line,
            sourceType: "code",
            analyzer,
        },
        sourceReliability: opts.sourceReliability ?? SourceReliability.CONFIG,
        confidence: opts.confidence ?? SourceReliability.HEURISTIC,
        evidence: opts.evidence || [],
    });
};

/**
 * A user-facing feature inferred from dependency + controller analysis.
 */
export const feature = (opts = {}) => {
    const title = opts.title || opts.value?.title || "";
    const description = opts.description || opts.value?.description || "";
    const id = opts.id || generateFactId("feature", "root", title);

    return createFact({
        id,
        type: "feature",
        value: {
            title,
            description,
        },
        source: {
            service: opts.service || null,
            file: null,
            line: null,
            sourceType: "inference",
            analyzer: "feature-analyzer",
        },
        sourceReliability: SourceReliability.HEURISTIC,
        confidence: opts.confidence ?? SourceReliability.HEURISTIC,
        evidence: opts.evidence || [],
    });
};

/**
 * A technical capability tag (Authentication, CRUD, Caching, etc.)
 */
export const capability = (opts = {}) => {
    const name = opts.name || opts.value?.name || "";
    const id = opts.id || generateFactId("capability", "root", name);

    return createFact({
        id,
        type: "capability",
        value: {
            name,
        },
        source: {
            service: opts.service || null,
            file: null,
            line: null,
            sourceType: "inference",
            analyzer: "feature-analyzer",
        },
        sourceReliability: SourceReliability.HEURISTIC,
        confidence: opts.confidence ?? SourceReliability.HEURISTIC,
        evidence: opts.evidence || [],
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Adapter Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const fromLegacyRoute = (route, serviceName) => endpoint({
    method: route.method,
    path: route.path,
    handler: route.controller || null,
    service: serviceName || null,
    file: route.file || route.source?.file || null,
    line: route.source?.line || null,
    sourceType: "ast",
    analyzer: "express-route-analyzer",
    sourceReliability: SourceReliability.AST,
    confidence: SourceReliability.AST,
    evidence: ["Express route analyzer (paren-depth scanner + alias tracking)"],
});

export const fromLegacyModel = (model, technology, serviceName) => datastore({
    technology: technology || "MongoDB",
    service: serviceName || null,
    entities: [model.name].filter(Boolean),
    file: model.file || null,
    sourceType: "ast",
    analyzer: "mongoose-model-analyzer",
    sourceReliability: SourceReliability.AST,
    confidence: SourceReliability.AST,
    evidence: [`${model.name} model definition in source`],
});

// ─────────────────────────────────────────────────────────────────────────────
// Fact Query Utilities
// ─────────────────────────────────────────────────────────────────────────────

export const filterByType = (facts, type) =>
    (facts || []).filter(f => f.type === type);

export const filterByService = (facts, serviceName) =>
    (facts || []).filter(f => (f.source?.service === serviceName || f.service === serviceName));

export const sortByConfidence = (facts) =>
    [...(facts || [])].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

export const getEndpoints = (facts) =>
    sortByConfidence(filterByType(facts, "endpoint"));

export const getDatastores = (facts) =>
    filterByType(facts, "datastore");

export const getEnvVars = (facts) => {
    const seen = new Set();
    return filterByType(facts, "envvar").filter(f => {
        const k = f.key;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

export const getServiceCalls = (facts) =>
    filterByType(facts, "servicecall");

export const getEvents = (facts) =>
    filterByType(facts, "event");

export const Fact = {
    endpoint,
    datastore,
    service,
    envvar,
    dependency,
    servicecall,
    event,
    feature,
    capability,
    fromLegacyRoute,
    fromLegacyModel,
    generateFactId,
    filterByType,
    filterByService,
    sortByConfidence,
    getEndpoints,
    getDatastores,
    getEnvVars,
    getServiceCalls,
    getEvents,
};
