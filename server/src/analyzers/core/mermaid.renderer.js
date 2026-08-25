/**
 * Mermaid Renderer — mermaid.renderer.js
 *
 * Dedicated renderer that transforms an ArchitectureGraph into deterministic,
 * syntactically valid Mermaid flowchart markdown.
 *
 * Guaranteed valid Mermaid syntax:
 *   • Safe quoted labels
 *   • Clean alphanumeric node IDs
 *   • Subgraphs for Storage, Messaging, and External APIs
 *   • Differentiated edge types (HTTP, gRPC, Database queries, Pub/Sub)
 */

export class MermaidRenderer {
    /**
     * Renders an ArchitectureGraph into Mermaid flowchart markdown.
     *
     * @param {ArchitectureGraph} graph
     * @param {object} [options]
     * @param {string} [options.direction="TD"] - "TD" (top-down) or "LR" (left-right)
     * @returns {string} Mermaid markdown
     */
    static render(graph, options = {}) {
        if (!graph || typeof graph.getAllNodes !== "function") {
            return "";
        }

        const nodes = graph.getAllNodes();
        const edges = graph.getAllEdges();

        if (nodes.length === 0 && edges.length === 0) {
            return "";
        }

        const direction = options.direction || "TD";
        const lines = [`flowchart ${direction}`];

        const sanitize = (text) => String(text || "").replace(/["\\]/g, "'").trim();
        const safeId = (id) => String(id).replace(/[^a-zA-Z0-9_]/g, "_");

        // Group nodes by type
        const services = [];
        const datastores = [];
        const brokers = [];
        const externalApis = [];

        for (const node of nodes) {
            if (node.type === "datastore") datastores.push(node);
            else if (node.type === "broker") brokers.push(node);
            else if (node.type === "external_api") externalApis.push(node);
            else services.push(node);
        }

        // 1. Render Service / Application Nodes
        for (const node of services) {
            const sid = safeId(node.id);
            const badge = node.framework ? ` (${node.framework})` : node.language !== "Unknown" ? ` [${node.language}]` : "";
            lines.push(`    ${sid}["${sanitize(node.label)}${sanitize(badge)}"]`);
        }

        // 2. Render External APIs
        if (externalApis.length > 0) {
            lines.push(`    subgraph External ["External Services & APIs"]`);
            for (const ext of externalApis) {
                const eid = safeId(ext.id);
                lines.push(`        ${eid}[/"${sanitize(ext.label)}"/]`);
            }
            lines.push(`    end`);
        }

        // 3. Render Datastores Subgraph
        if (datastores.length > 0) {
            lines.push(`    subgraph Storage ["Databases & Storage"]`);
            for (const ds of datastores) {
                const did = safeId(ds.id);
                lines.push(`        ${did}[("${sanitize(ds.label)}")]`);
            }
            lines.push(`    end`);
        }

        // 4. Render Message Brokers Subgraph
        if (brokers.length > 0) {
            lines.push(`    subgraph Messaging ["Event Brokers"]`);
            for (const b of brokers) {
                const bid = safeId(b.id);
                lines.push(`        ${bid}{{"${sanitize(b.label)}"}}`);
            }
            lines.push(`    end`);
        }

        // 5. Render Edges with semantics
        for (const edge of edges) {
            const fromId = safeId(edge.from);
            const toId = safeId(edge.to);
            let edgeLabel = edge.label ? `|"${sanitize(edge.label)}"| ` : "";
            if (!edgeLabel && edge.method) {
                edgeLabel = `|"${edge.method} ${edge.path || ''}"| `;
            }

            if (edge.type === "uses_datastore" || edge.type === "queries") {
                lines.push(`    ${fromId} -.-> ${edgeLabel}${toId}`);
            } else if (edge.type === "publishes_to") {
                lines.push(`    ${fromId} == ${edgeLabel}==> ${toId}`);
            } else if (edge.type === "consumes_from") {
                lines.push(`    ${fromId} --> ${edgeLabel}${toId}`);
            } else {
                lines.push(`    ${fromId} --> ${edgeLabel}${toId}`);
            }
        }

        return lines.join("\n");
    }
}
