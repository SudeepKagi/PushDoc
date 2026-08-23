/**
 * Diagram Graph Analyzer
 *
 * Extracts a compact directed edge list representing the architectural flow
 * between modules in a repository.
 *
 * Uses the import/require relationships from source files, filtered and capped
 * to the top N (default: 12–15) most connected nodes to prevent overwhelming
 * the diagram visualizer.
 *
 * Output format:
 *   {
 *     nodes: ["auth.controller", "user.service", "user.model", "db"],
 *     edges: [
 *       { from: "auth.controller", to: "user.service" },
 *       { from: "user.service", to: "user.model" }
 *     ]
 *   }
 */

import { rankByInDegree } from "./dependency.graph.js";

const IMPORT_FROM_PATTERN = /(?:import|require|from)\s+["']([^"']+)["']/g;

const SKIP_EXTENSIONS = new Set([
    ".json", ".md", ".env", ".yaml", ".yml",
    ".png", ".jpg", ".jpeg", ".svg", ".ico",
    ".css", ".scss", ".html",
]);

/**
 * Extracts a compact list of architectural dependencies between top files.
 *
 * @param {Array<{ path: string, content: string, extension?: string }>} files
 * @param {number} maxNodes - Maximum number of nodes to include in diagram (default: 12)
 * @returns {{ nodes: string[], edges: Array<{ from: string, to: string }> }}
 */
export const extractDiagramEdges = (files, maxNodes = 12) => {
    if (!files || files.length === 0) {
        return { nodes: [], edges: [] };
    }

    const pathSet = new Set(files.map(f => normaliseFilePath(f.path)));
    const rawEdges = [];

    for (const file of files) {
        const ext = (file.extension || "").toLowerCase();
        if (SKIP_EXTENSIONS.has(ext)) continue;
        if (!file.content) continue;

        IMPORT_FROM_PATTERN.lastIndex = 0;
        let match;

        while ((match = IMPORT_FROM_PATTERN.exec(file.content)) !== null) {
            const importTarget = match[1];
            if (!importTarget.startsWith(".")) continue;

            const resolvedPath = resolveImport(file.path, importTarget, pathSet, files);
            if (resolvedPath && resolvedPath !== file.path) {
                rawEdges.push({
                    from: file.path,
                    to: resolvedPath,
                });
            }
        }
    }

    if (rawEdges.length === 0) {
        return { nodes: [], edges: [] };
    }

    // Rank files by in-degree to prioritize the most important components
    const ranked = rankByInDegree(files);
    const topPaths = new Set(
        ranked.slice(0, maxNodes).map(r => r.path)
    );

    // Keep edges where both or at least one is in topPaths, up to maxNodes total unique nodes
    const selectedNodes = new Set();
    const finalEdges = [];

    for (const edge of rawEdges) {
        if (topPaths.has(edge.from) || topPaths.has(edge.to)) {
            if (selectedNodes.size < maxNodes || (selectedNodes.has(edge.from) && selectedNodes.has(edge.to))) {
                selectedNodes.add(edge.from);
                selectedNodes.add(edge.to);
                finalEdges.push({
                    from: formatNodeLabel(edge.from),
                    to: formatNodeLabel(edge.to),
                });
            }
        }
    }

    // Deduplicate edges
    const seenEdge = new Set();
    const uniqueEdges = finalEdges.filter(e => {
        const key = `${e.from}->${e.to}`;
        if (seenEdge.has(key)) return false;
        seenEdge.add(key);
        return true;
    });

    const uniqueNodes = Array.from(
        new Set(uniqueEdges.flatMap(e => [e.from, e.to]))
    ).slice(0, maxNodes);

    // Filter edges to only include nodes within uniqueNodes
    const allowedNodeSet = new Set(uniqueNodes);
    const cappedEdges = uniqueEdges.filter(
        e => allowedNodeSet.has(e.from) && allowedNodeSet.has(e.to)
    );

    return {
        nodes: uniqueNodes,
        edges: cappedEdges,
    };
};

/**
 * Converts a file path into a concise, human-friendly node name for diagrams.
 * E.g. "src/controllers/auth.controller.js" -> "auth.controller"
 *      "server.js" -> "server"
 */
export const formatNodeLabel = (filePath) => {
    if (!filePath) return "unknown";
    const parts = filePath.replace(/\\/g, "/").split("/");
    const filename = parts[parts.length - 1];
    // Strip common extensions (.js, .ts, .jsx, .tsx)
    return filename.replace(/\.(js|ts|jsx|tsx|mjs|cjs)$/i, "");
};

// ── Internal Helpers ──────────────────────────────────────────────────────────

function normaliseFilePath(filePath) {
    return filePath.replace(/\\/g, "/").toLowerCase();
}

function resolveImport(importingFilePath, importTarget, pathSet, files) {
    const importerDir = importingFilePath.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
    const candidate = joinPaths(importerDir, importTarget).replace(/\\/g, "/").toLowerCase();

    const extensionCandidates = [
        candidate,
        candidate + ".js",
        candidate + ".ts",
        candidate + ".jsx",
        candidate + ".tsx",
        candidate + ".mjs",
        candidate + "/index.js",
        candidate + "/index.ts",
    ];

    for (const ext of extensionCandidates) {
        if (pathSet.has(ext)) {
            const original = files.find(f => normaliseFilePath(f.path) === ext);
            return original ? original.path : null;
        }
    }

    return null;
}

function joinPaths(base, relative) {
    const parts = (base + "/" + relative).split("/");
    const resolved = [];

    for (const part of parts) {
        if (part === "..") {
            resolved.pop();
        } else if (part !== ".") {
            resolved.push(part);
        }
    }

    return resolved.join("/");
}
