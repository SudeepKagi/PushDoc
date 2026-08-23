/**
 * Dependency Graph Analyzer
 *
 * Builds an in-degree map from a repository's file set by scanning import/require
 * statements in the source code. A file's in-degree is the number of other files
 * that import it. High in-degree files are the shared utilities, services, config,
 * and models — exactly the files that give an LLM the most architectural signal.
 *
 * This is a PageRank approximation: one pass over all files, O(files × lines),
 * no external library, fully explainable. Good enough for ranking 15–200 files.
 *
 * The result is used by repositoryContext.builder.js to pick the top-N files
 * for the embedding pipeline, avoiding the cost of embedding low-value files
 * like one-off scripts, test fixtures, or generated output.
 */

// Patterns that look like local file imports.
// Matches: import ... from "./foo", require("../bar"), import("./baz")
const IMPORT_FROM_PATTERN = /(?:import|require|from)\s+["']([^"']+)["']/g;

// File extensions we skip — they're not JS/TS source, so scanning them for
// import statements produces noise.
const SKIP_EXTENSIONS = new Set([
    ".json", ".md", ".env", ".yaml", ".yml",
    ".png", ".jpg", ".jpeg", ".svg", ".ico",
    ".css", ".scss", ".html",
]);

/**
 * Builds a ranked list of files sorted by how many other files import them.
 *
 * @param {Array<{ path: string, content: string, extension?: string }>} files
 * @returns {Array<{ path: string, inDegree: number }>} — sorted highest-first
 */
export const rankByInDegree = (files) => {
    if (!files || files.length === 0) return [];

    // Build a quick lookup from file basename (no extension) and relative path
    // to the canonical path in our file list, so we can match import targets.
    const pathSet = new Set(files.map(f => normaliseFilePath(f.path)));

    // Count: how many source files import each given file?
    const inDegreeMap = new Map();

    // Initialise every file at 0 so files with no importers still appear in results.
    for (const file of files) {
        inDegreeMap.set(file.path, 0);
    }

    for (const file of files) {
        const ext = (file.extension || "").toLowerCase();
        if (SKIP_EXTENSIONS.has(ext)) continue;
        if (!file.content) continue;

        // Reset regex lastIndex before each scan (global regex is stateful)
        IMPORT_FROM_PATTERN.lastIndex = 0;
        let match;

        while ((match = IMPORT_FROM_PATTERN.exec(file.content)) !== null) {
            const importTarget = match[1];

            // Skip node_modules and absolute-path imports — we only care about
            // relative imports that reference files in our repo.
            if (!importTarget.startsWith(".")) continue;

            // Resolve the import target to a canonical path in our file list.
            const resolvedPath = resolveImport(file.path, importTarget, pathSet, files);
            if (resolvedPath) {
                inDegreeMap.set(resolvedPath, (inDegreeMap.get(resolvedPath) || 0) + 1);
            }
        }
    }

    // Sort descending by in-degree. Files with the same in-degree keep their
    // original order (stable sort in V8 for arrays ≤ ~125 elements).
    return [...inDegreeMap.entries()]
        .map(([path, inDegree]) => ({ path, inDegree }))
        .sort((a, b) => b.inDegree - a.inDegree);
};

/**
 * Returns the top-N files by in-degree, as full file objects.
 *
 * @param {Array<{ path: string, content: string, extension?: string }>} files
 * @param {number} topN - Maximum number of files to return
 * @returns {Array<{ path: string, content: string, extension?: string }>}
 */
export const selectTopFiles = (files, topN) => {
    if (!files || files.length === 0) return [];
    if (files.length <= topN) return files;

    const ranked = rankByInDegree(files);
    const topPaths = new Set(ranked.slice(0, topN).map(r => r.path));

    return files.filter(f => topPaths.has(f.path));
};

// ── Helpers ────────────────────────────────────────────────────────────────

function normaliseFilePath(filePath) {
    return filePath.replace(/\\/g, "/").toLowerCase();
}

/**
 * Attempts to resolve an import string like `"../services/auth"` to the
 * canonical path of the actual file in our file list.
 *
 * Strategy:
 *   1. Compute the directory of the importing file.
 *   2. Join with the import target to get a candidate relative path.
 *   3. Try with each common extension (.js, .ts, .jsx, .tsx, /index.js, etc.)
 *   4. Return the first match found in our file list.
 */
function resolveImport(importingFilePath, importTarget, pathSet, files) {
    const importerDir = importingFilePath.replace(/\\/g, "/").split("/").slice(0, -1).join("/");

    // Join importer dir with the import target and normalise path segments
    const candidate = joinPaths(importerDir, importTarget).replace(/\\/g, "/").toLowerCase();

    // Extensions to try in priority order
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
            // Find the original-cased path to return
            const original = files.find(f => normaliseFilePath(f.path) === ext);
            return original ? original.path : null;
        }
    }

    return null;
}

/**
 * Joins two path segments and resolves `../` and `./` components.
 * Lightweight alternative to `path.resolve()` that works on any path string
 * without depending on the current working directory.
 */
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
