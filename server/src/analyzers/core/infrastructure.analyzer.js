/**
 * Infrastructure Analyzer — infrastructure.analyzer.js
 *
 * Extracts architectural facts from infrastructure and contract files that
 * exist independently of any programming language:
 *
 *   docker-compose.yml   → service topology, ports, env vars
 *   Dockerfile           → runtime, exposed ports, entry command
 *   k8s/*.yaml           → deployment topology, env vars, replicas
 *   openapi.yaml/.json   → API endpoints (highest confidence — spec is source of truth)
 *   swagger.yaml         → same as openapi
 *   *.proto              → gRPC service definitions + RPC methods
 *   *.graphql / *.gql    → GraphQL types, queries, mutations
 *   .env.example         → required environment variables
 *   .env.sample          → same as .env.example
 *   .env.template        → same as .env.example
 *
 * WHY THIS IS IMPORTANT
 * ─────────────────────
 * For languages where PushDoc has no AST-level analyzer (Rust, C#, Scala, etc.),
 * infrastructure files are often the richest available signal. An OpenAPI spec
 * or docker-compose.yml can tell us the full API surface of a service regardless
 * of the implementation language.
 *
 * OUTPUT CONTRACT
 * ───────────────
 * Returns a flat Fact[] array. All facts reference the source file in their
 * evidence[]. The orchestrator merges this with plugin-produced facts.
 */

import * as Fact from "./fact.schema.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs all infrastructure analyzers and returns combined facts.
 *
 * @param {Array<{path, content, extension}>} files — all repository files
 * @param {string} [serviceName] — logical service name for fact attribution
 * @returns {Fact[]}
 */
export const analyzeInfrastructure = (files, serviceName) => {
    const facts = [];
    const svc   = serviceName || null;

    for (const file of files) {
        const normalized = file.path.replace(/\\/g, "/");
        const basename   = normalized.split("/").pop().toLowerCase();

        // ── OpenAPI / Swagger ─────────────────────────────────────────────────
        if (isOpenApiFile(basename, file.content)) {
            facts.push(...parseOpenApi(file, svc));
            continue;
        }

        // ── .env.example / .env.sample ────────────────────────────────────────
        if (basename === ".env.example" || basename === ".env.sample" || basename === ".env.template") {
            facts.push(...parseEnvFile(file, svc));
            continue;
        }

        // ── Dockerfile ────────────────────────────────────────────────────────
        if (basename === "dockerfile") {
            facts.push(...parseDockerfile(file, svc));
            continue;
        }

        // ── docker-compose.yml ────────────────────────────────────────────────
        if (basename === "docker-compose.yml" || basename === "docker-compose.yaml") {
            facts.push(...parseDockerComposeEnvVars(file, svc));
            continue;
        }

        // ── Kubernetes YAML ────────────────────────────────────────────────────
        if ((normalized.includes("/k8s/") || normalized.includes("/kubernetes/") ||
             normalized.startsWith("k8s/") || normalized.startsWith("kubernetes/")) &&
            (basename.endsWith(".yaml") || basename.endsWith(".yml"))) {
            facts.push(...parseK8sYaml(file, svc));
            continue;
        }

        // ── Protocol Buffers ──────────────────────────────────────────────────
        if (basename.endsWith(".proto")) {
            facts.push(...parseProto(file, svc));
            continue;
        }

        // ── GraphQL schemas ───────────────────────────────────────────────────
        if (basename.endsWith(".graphql") || basename.endsWith(".gql")) {
            facts.push(...parseGraphql(file, svc));
            continue;
        }
    }

    return facts;
};

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI / Swagger parser
// ─────────────────────────────────────────────────────────────────────────────

function isOpenApiFile(basename, content) {
    if (basename === "openapi.yaml" || basename === "openapi.yml" ||
        basename === "openapi.json" || basename === "swagger.yaml" ||
        basename === "swagger.yml"  || basename === "swagger.json") {
        return true;
    }
    // Also detect by content signature
    return /openapi:\s*['"]?3\./i.test(content) || /swagger:\s*['"]?2\./i.test(content);
}

function parseOpenApi(file, serviceName) {
    const facts = [];
    const content = file.content;

    // Extract paths using YAML path pattern: /path:\n  method:
    // This handles both YAML and JSON OpenAPI specs.
    const pathRegex = /^\s{2}(\/[^\s:]+):\s*$/gm;
    let pathMatch;

    while ((pathMatch = pathRegex.exec(content)) !== null) {
        const path = pathMatch[1];
        const startIndex = pathMatch.index + pathMatch[0].length;
        const rest = content.slice(startIndex);
        
        // Isolate block until next path definition or top-level key
        const nextBoundary = rest.search(/^(\s{2}\/[^\s:]+:|^\S)/m);
        const methodBlock = nextBoundary !== -1 ? rest.slice(0, nextBoundary) : rest;

        // Find HTTP methods defined strictly under this path (indented by 4 spaces)
        const methodRegex = /^\s{4}(get|post|put|patch|delete|options|head):\s*$/gim;
        let methodMatch;

        while ((methodMatch = methodRegex.exec(methodBlock)) !== null) {
            const methodStartIndex = methodMatch.index + methodMatch[0].length;
            const restMethod = methodBlock.slice(methodStartIndex);
            const nextMethodBoundary = restMethod.search(/^\s{4}(get|post|put|patch|delete|options|head):/im);
            const singleMethodBlock = nextMethodBoundary !== -1 ? restMethod.slice(0, nextMethodBoundary) : restMethod;

            const opIdMatch    = singleMethodBlock.match(/operationId:\s*(\S+)/i);
            const summaryMatch = singleMethodBlock.match(/summary:\s*([^\n]+)/i);

            facts.push(Fact.endpoint({
                method:     methodMatch[1].toUpperCase(),
                path,
                handler:    opIdMatch?.[1]?.trim() || summaryMatch?.[1]?.trim() || null,
                service:    serviceName,
                file:       file.path,
                sourceType: "spec",
                sourceReliability: Fact.SourceReliability.SPEC,
                confidence: 0.99,
                evidence:   [`OpenAPI specification: ${file.path}`],
            }));
        }
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// .env.example parser
// ─────────────────────────────────────────────────────────────────────────────

function parseEnvFile(file, serviceName) {
    const facts = [];

    for (const line of file.content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const eqIdx = trimmed.indexOf("=");
        const key   = eqIdx !== -1 ? trimmed.substring(0, eqIdx).trim() : trimmed;

        if (key && /^[A-Z_][A-Z0-9_]*$/.test(key)) {
            facts.push(Fact.envvar({
                key,
                source:     "file",
                service:    serviceName,
                confidence: Fact.Confidence.SPEC,
                evidence:   [file.path],
            }));
        }
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dockerfile parser
// ─────────────────────────────────────────────────────────────────────────────

function parseDockerfile(file, serviceName) {
    const facts = [];
    const content = file.content;

    // ENV VAR declarations: ENV KEY=VALUE or ENV KEY VALUE
    const envMatches = content.matchAll(/^ENV\s+([A-Z_][A-Z0-9_]*)/gm);
    for (const m of envMatches) {
        facts.push(Fact.envvar({
            key:        m[1],
            source:     "file",
            service:    serviceName,
            confidence: Fact.Confidence.SPEC,
            evidence:   [`Dockerfile ENV: ${file.path}`],
        }));
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// docker-compose.yml — extract env vars per service
// ─────────────────────────────────────────────────────────────────────────────

function parseDockerComposeEnvVars(file, serviceName) {
    const facts = [];

    // Match environment variable names under environment: blocks
    const envMatches = file.content.matchAll(/^\s+[-\s]*([\w]+)(?:=|:)/gm);
    for (const m of envMatches) {
        const key = m[1];
        if (/^[A-Z_][A-Z0-9_]*$/.test(key)) {
            facts.push(Fact.envvar({
                key,
                source:     "file",
                service:    serviceName,
                confidence: Fact.Confidence.HEURISTIC,
                evidence:   [`docker-compose.yml environment block`],
            }));
        }
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Kubernetes YAML parser
// ─────────────────────────────────────────────────────────────────────────────

function parseK8sYaml(file, serviceName) {
    const facts = [];
    const content = file.content;

    // Extract env var names from ConfigMap and Deployment env blocks
    const envNameMatches = content.matchAll(/name:\s+([A-Z_][A-Z0-9_]*)/g);
    for (const m of envNameMatches) {
        facts.push(Fact.envvar({
            key:        m[1],
            source:     "file",
            service:    serviceName,
            confidence: Fact.Confidence.HEURISTIC,
            evidence:   [`Kubernetes manifest: ${file.path}`],
        }));
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Protocol Buffer parser
// ─────────────────────────────────────────────────────────────────────────────

function parseProto(file, serviceName) {
    const facts = [];
    const content = file.content;

    // Extract service name
    const serviceMatch = content.match(/^service\s+(\w+)\s*\{/m);
    const grpcService  = serviceMatch?.[1] || null;

    // Extract RPC method definitions: rpc MethodName(Request) returns (Response)
    const rpcMatches = content.matchAll(/^\s*rpc\s+(\w+)\s*\(/gm);
    for (const m of rpcMatches) {
        facts.push(Fact.endpoint({
            method:     "RPC",
            path:       `/${grpcService || ""}/${m[1]}`,
            handler:    m[1],
            service:    serviceName,
            file:       file.path,
            confidence: Fact.Confidence.SPEC,
            evidence:   [`gRPC proto definition: ${file.path}`],
        }));
    }

    return facts;
}

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL schema parser
// ─────────────────────────────────────────────────────────────────────────────

function parseGraphql(file, serviceName) {
    const facts = [];
    const content = file.content;

    // Extract Query fields: field(args): ReturnType
    const queryBlock = content.match(/type\s+Query\s*\{([^}]+)\}/i)?.[1] || "";
    const mutBlock   = content.match(/type\s+Mutation\s*\{([^}]+)\}/i)?.[1] || "";

    const queryFields    = extractGraphqlFields(queryBlock);
    const mutationFields = extractGraphqlFields(mutBlock);

    for (const field of queryFields) {
        facts.push(Fact.endpoint({
            method:     "QUERY",
            path:       `/${field}`,
            handler:    field,
            service:    serviceName,
            file:       file.path,
            confidence: Fact.Confidence.SPEC,
            evidence:   [`GraphQL Query field: ${file.path}`],
        }));
    }

    for (const field of mutationFields) {
        facts.push(Fact.endpoint({
            method:     "MUTATION",
            path:       `/${field}`,
            handler:    field,
            service:    serviceName,
            file:       file.path,
            confidence: Fact.Confidence.SPEC,
            evidence:   [`GraphQL Mutation field: ${file.path}`],
        }));
    }

    return facts;
}

function extractGraphqlFields(block) {
    const fields = [];
    const matches = block.matchAll(/^\s+(\w+)\s*[(:]/gm);
    for (const m of matches) fields.push(m[1]);
    return fields;
}
