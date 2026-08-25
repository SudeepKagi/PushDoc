/**
 * Architecture Graph — architecture.graph.js (Production V6)
 *
 * The canonical derived architectural model for PushDoc.
 *
 * DESIGN PRINCIPLES
 * ─────────────────
 * 1. Pure Data Model:
 *    • Decoupled from rendering (Mermaid renderer) and prompt formatting (Context Builder).
 * 2. Bi-directional Traceability:
 *    • Every node and edge retains references to the underlying raw `evidenceFactIds`.
 * 3. Typed Node & Edge Semantics:
 *    • Node types: `service`, `application`, `library`, `datastore`, `broker`, `external_api`.
 *    • Edge types: `calls`, `uses_datastore`, `owns_entity`, `publishes_to`, `consumes_from`, `depends_on`.
 */

export class ArchitectureGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.metadata = {
            createdAt: new Date().toISOString(),
            version: "2.0",
        };
    }

    /**
     * Adds or updates a component node in the architecture graph.
     */
    addNode({
        id,
        label,
        type = "service",
        componentType = "service",
        ecosystem = "unknown",
        language = "Unknown",
        framework = null,
        evidenceFactIds = [],
        metadata = {},
    }) {
        if (!id) return;
        const cleanId = String(id).replace(/[^a-zA-Z0-9_:\-]/g, "_");

        if (!this.nodes.has(cleanId)) {
            this.nodes.set(cleanId, {
                id: cleanId,
                label: label || cleanId,
                type,
                componentType,
                ecosystem,
                language,
                framework,
                evidenceFactIds: [...new Set(evidenceFactIds)],
                metadata,
            });
        } else {
            // Merge metadata and evidence
            const existing = this.nodes.get(cleanId);
            existing.evidenceFactIds = [...new Set([...existing.evidenceFactIds, ...evidenceFactIds])];
            if (framework && !existing.framework) existing.framework = framework;
            if (language && existing.language === "Unknown") existing.language = language;
            if (ecosystem && existing.ecosystem === "unknown") existing.ecosystem = ecosystem;
        }

        return this.nodes.get(cleanId);
    }

    /**
     * Adds a directed relationship edge between two nodes.
     */
    addEdge({
        from,
        to,
        type = "calls",
        label = "",
        protocol = "HTTP",
        method = null,
        path = null,
        confidence = 0.90,
        evidenceFactIds = [],
        evidence = [],
    }) {
        if (!from || !to) return;
        const cleanFrom = String(from).replace(/[^a-zA-Z0-9_:\-]/g, "_");
        const cleanTo   = String(to).replace(/[^a-zA-Z0-9_:\-]/g, "_");

        const edgeId = `${cleanFrom}->${cleanTo}:${type}:${label || method || ""}`;
        const existing = this.edges.find(e => e.id === edgeId);

        if (!existing) {
            this.edges.push({
                id: edgeId,
                from: cleanFrom,
                to: cleanTo,
                type,
                label,
                protocol,
                method,
                path,
                confidence,
                evidenceFactIds: [...new Set(evidenceFactIds)],
                evidence,
            });
        } else {
            existing.evidenceFactIds = [...new Set([...existing.evidenceFactIds, ...evidenceFactIds])];
            existing.evidence = [...new Set([...(existing.evidence || []), ...evidence])];
        }
    }

    getNode(id) {
        return this.nodes.get(String(id).replace(/[^a-zA-Z0-9_:\-]/g, "_"));
    }

    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    getAllEdges() {
        return [...this.edges];
    }

    getOutboundEdges(nodeId) {
        const clean = String(nodeId).replace(/[^a-zA-Z0-9_:\-]/g, "_");
        return this.edges.filter(e => e.from === clean);
    }

    getInboundEdges(nodeId) {
        const clean = String(nodeId).replace(/[^a-zA-Z0-9_:\-]/g, "_");
        return this.edges.filter(e => e.to === clean);
    }

    toJSON() {
        return {
            nodes: this.getAllNodes(),
            edges: this.getAllEdges(),
            metadata: this.metadata,
        };
    }
}
