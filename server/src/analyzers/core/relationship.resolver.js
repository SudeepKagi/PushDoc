/**
 * Cross-Service Relationship Resolver — relationship.resolver.js (Production V6)
 *
 * Constructs the canonical ArchitectureGraph from normalized facts.
 *
 * RESPONSIBILITIES
 * ────────────────
 * 1. Service & Application Nodes:
 *    Maps discovered service facts to graph nodes with their component types.
 *
 * 2. HTTP Cross-Service Call & External API Resolution:
 *    • Internal service calls: matches hostnames and URLs to known internal services.
 *    • External APIs: categorizes external domains (e.g. Stripe, AWS S3, Google Maps)
 *      as `external_api` nodes.
 *
 * 3. Message Broker Pub/Sub Topology:
 *    • Maps events to broker nodes with `publishes_to` and `consumes_from` edges.
 *
 * 4. Datastore & Entity Graph Mapping:
 *    • Connects services to databases and caches with `uses_datastore` edges.
 *
 * 5. Full Traceability:
 *    • Links every graph node and edge back to its underlying `evidenceFactIds`.
 */

import { ArchitectureGraph } from "./architecture.graph.js";
import * as Fact from "./fact.schema.js";

// Known public/external API hosts
const EXTERNAL_API_PATTERNS = [
    { pattern: /stripe\.com/i, label: "Stripe API" },
    { pattern: /twilio\.com/i, label: "Twilio API" },
    { pattern: /sendgrid\.com/i, label: "SendGrid API" },
    { pattern: /googleapis\.com|google\.com/i, label: "Google Cloud API" },
    { pattern: /amazonaws\.com/i, label: "AWS Services" },
    { pattern: /github\.com\/api/i, label: "GitHub API" },
    { pattern: /auth0\.com/i, label: "Auth0 API" },
    { pattern: /cloudinary\.com/i, label: "Cloudinary API" },
    { pattern: /mapbox\.com/i, label: "Mapbox API" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves relationships from normalized facts into the ArchitectureGraph.
 *
 * @param {Array<Fact.service>} services
 * @param {Array<Fact>} normalizedFacts
 * @returns {ArchitectureGraph}
 */
export const resolveRelationships = (services = [], normalizedFacts = []) => {
    const graph = new ArchitectureGraph();

    // ── 1. Register Service & Application Nodes ───────────────────────────────
    const serviceMap = new Map();

    for (const svc of services) {
        const name = svc.value?.name || svc.name || "root";
        const cleanName = name.toLowerCase();
        serviceMap.set(cleanName, svc);
        serviceMap.set(cleanName.replace(/[-_]service$/i, ""), svc);

        graph.addNode({
            id: name,
            label: name,
            type: svc.value?.componentType === "application" ? "application" : "service",
            componentType: svc.value?.componentType || "service",
            ecosystem: svc.value?.ecosystem || "unknown",
            language: svc.value?.language || "Unknown",
            framework: svc.value?.framework || null,
            evidenceFactIds: [svc.id].filter(Boolean),
        });
    }

    // ── 2. Datastore Mapping (uses_datastore) ──────────────────────────────────
    const datastores = Fact.getDatastores(normalizedFacts);
    const seenDatastores = new Set();

    for (const ds of datastores) {
        const tech = ds.value?.technology || ds.technology || "Database";
        const svcName = ds.source?.service || ds.service || (services[0]?.name) || "service";
        const dsNodeId = `db_${tech.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

        if (!seenDatastores.has(dsNodeId)) {
            seenDatastores.add(dsNodeId);
            graph.addNode({
                id: dsNodeId,
                label: tech,
                type: "datastore",
                componentType: "datastore",
                evidenceFactIds: [ds.id].filter(Boolean),
                metadata: { entities: ds.value?.entities || [] },
            });
        }

        graph.addEdge({
            from: svcName,
            to: dsNodeId,
            type: "uses_datastore",
            label: (ds.value?.entities || []).length > 0 ? ds.value.entities.join(", ") : tech,
            confidence: ds.confidence,
            evidenceFactIds: [ds.id].filter(Boolean),
            evidence: ds.evidence,
        });
    }

    // ── 3. Message Broker & Event Flows (publishes_to / consumes_from) ─────────
    const events = Fact.getEvents(normalizedFacts);
    const seenBrokers = new Set();

    for (const ev of events) {
        const broker = ev.value?.broker || ev.broker || "Message Broker";
        const topic = ev.value?.topic || ev.topic || "events";
        const brokerNodeId = `broker_${broker.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

        if (!seenBrokers.has(brokerNodeId)) {
            seenBrokers.add(brokerNodeId);
            graph.addNode({
                id: brokerNodeId,
                label: broker,
                type: "broker",
                componentType: "broker",
                evidenceFactIds: [ev.id].filter(Boolean),
            });
        }

        const producer = ev.value?.producer || ev.producer;
        if (producer) {
            graph.addEdge({
                from: producer,
                to: brokerNodeId,
                type: "publishes_to",
                label: topic,
                confidence: ev.confidence,
                evidenceFactIds: [ev.id].filter(Boolean),
                evidence: ev.evidence,
            });
        }

        const consumer = ev.value?.consumer || ev.consumer;
        if (consumer) {
            graph.addEdge({
                from: brokerNodeId,
                to: consumer,
                type: "consumes_from",
                label: topic,
                confidence: ev.confidence,
                evidenceFactIds: [ev.id].filter(Boolean),
                evidence: ev.evidence,
            });
        }
    }

    // ── 4. Cross-Service Calls & External APIs (calls) ────────────────────────
    const serviceCalls = Fact.getServiceCalls(normalizedFacts);
    const envVars = Fact.getEnvVars(normalizedFacts);
    const serviceUrlMap = buildServiceUrlMap(envVars, services);

    for (const call of serviceCalls) {
        const fromSvc = call.source?.service || call.from || (services[0]?.name) || "client";
        const rawUrl = call.value?.url || call.url || "";

        // Check if destination is a known external API
        const externalApi = matchExternalApi(rawUrl);
        if (externalApi) {
            const extNodeId = `ext_${externalApi.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            graph.addNode({
                id: extNodeId,
                label: externalApi.label,
                type: "external_api",
                componentType: "external_api",
                evidenceFactIds: [call.id].filter(Boolean),
            });

            graph.addEdge({
                from: fromSvc,
                to: extNodeId,
                type: "calls",
                method: call.value?.method || call.method || "GET",
                path: call.value?.path || call.path || "",
                protocol: call.value?.protocol || call.protocol || "HTTPS",
                confidence: call.confidence,
                evidenceFactIds: [call.id].filter(Boolean),
                evidence: call.evidence,
            });
            continue;
        }

        // Resolve internal service destination
        let targetSvc = call.value?.to || call.to;
        if (!targetSvc && rawUrl) {
            targetSvc = resolveTargetServiceFromUrl(rawUrl, serviceMap, serviceUrlMap);
        }

        if (targetSvc) {
            graph.addEdge({
                from: fromSvc,
                to: targetSvc,
                type: "calls",
                method: call.value?.method || call.method || "GET",
                path: call.value?.path || call.path || "",
                protocol: call.value?.protocol || call.protocol || "HTTP",
                confidence: call.confidence,
                evidenceFactIds: [call.id].filter(Boolean),
                evidence: call.evidence,
            });
        }
    }

    return graph;
};

// ─────────────────────────────────────────────────────────────────────────────
// Correlation Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildServiceUrlMap(envVars, services) {
    const map = new Map();

    for (const ev of envVars) {
        const key = ev.value?.key || ev.key || "";
        const match = key.match(/^([A-Z_]+)_(?:SERVICE|API|HOST|URL|BASE)$/i);
        if (match) {
            const prefix = match[1].toLowerCase().replace(/_/g, "-");
            const matchedSvc = services.find(s => {
                const sName = (s.value?.name || s.name || "").toLowerCase();
                return sName === prefix || sName.startsWith(prefix) || prefix.startsWith(sName);
            });
            if (matchedSvc) {
                map.set(key, matchedSvc.value?.name || matchedSvc.name);
            }
        }
    }

    return map;
}

function resolveTargetServiceFromUrl(url, serviceMap, serviceUrlMap) {
    if (!url) return null;

    // 1. Check template string env variable matches
    for (const [envKey, svcName] of serviceUrlMap.entries()) {
        if (url.includes(envKey)) return svcName;
    }

    // 2. Direct match with hostname
    try {
        const hostMatch = url.match(/https?:\/\/([^/:]+)/i);
        if (hostMatch) {
            const host = hostMatch[1].toLowerCase();
            if (serviceMap.has(host)) {
                const s = serviceMap.get(host);
                return s.value?.name || s.name;
            }
            const stripped = host.replace(/[-_]service$/i, "");
            if (serviceMap.has(stripped)) {
                const s = serviceMap.get(stripped);
                return s.value?.name || s.name;
            }
        }
    } catch {}

    // 3. Fallback: check if url contains any service name as a path token
    for (const [sName, sObj] of serviceMap.entries()) {
        if (sName.length > 3 && url.toLowerCase().includes(sName)) {
            return sObj.value?.name || sObj.name;
        }
    }

    return null;
}

function matchExternalApi(url) {
    if (!url) return null;
    for (const { pattern, label } of EXTERNAL_API_PATTERNS) {
        if (pattern.test(url)) {
            return { label };
        }
    }
    return null;
}
