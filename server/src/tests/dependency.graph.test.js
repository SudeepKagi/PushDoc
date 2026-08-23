/**
 * Pillar 3 — Dependency Graph Analyzer Tests
 *
 * Tests the in-degree ranking and file selection that controls which files
 * get embedded in the RAG pipeline. The key invariant: shared services and
 * utilities that are imported by many files should rank higher than one-off
 * scripts that import nothing and are imported by nothing.
 *
 * Run with: node --test src/tests/dependency.graph.test.js
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { rankByInDegree, selectTopFiles } from "../analyzers/dependency.graph.js";

// ── Fixture helpers ────────────────────────────────────────────────────────

const makeFile = (path, content, extension = ".js") => ({ path, content, extension });

// ── rankByInDegree tests ───────────────────────────────────────────────────

describe("rankByInDegree", () => {
    test("returns empty array for empty input", () => {
        assert.deepEqual(rankByInDegree([]), []);
        assert.deepEqual(rankByInDegree(null), []);
    });

    test("files with no imports all have in-degree 0", () => {
        const files = [
            makeFile("src/a.js", "const x = 1;"),
            makeFile("src/b.js", "const y = 2;"),
        ];
        const ranked = rankByInDegree(files);
        assert.equal(ranked.length, 2);
        assert.equal(ranked[0].inDegree, 0);
        assert.equal(ranked[1].inDegree, 0);
    });

    test("a file imported by two others gets in-degree 2", () => {
        const files = [
            makeFile("src/utils.js", "export const helper = () => {};"),
            makeFile("src/a.js",     `import { helper } from "./utils.js";`),
            makeFile("src/b.js",     `import { helper } from "./utils.js";`),
        ];
        const ranked = rankByInDegree(files);
        const utilsEntry = ranked.find(r => r.path === "src/utils.js");
        assert.equal(utilsEntry.inDegree, 2);
    });

    test("results are sorted highest in-degree first", () => {
        const files = [
            makeFile("src/utils.js",   "export const x = 1;"),
            makeFile("src/config.js",  "export const c = 2;"),
            makeFile("src/a.js",       `import "./utils.js"; import "./config.js";`),
            makeFile("src/b.js",       `import "./utils.js";`),
            makeFile("src/c.js",       `import "./config.js";`),
        ];
        const ranked = rankByInDegree(files);
        // utils and config both imported twice; they should be first two
        assert.equal(ranked[0].inDegree, 2);
        assert.equal(ranked[1].inDegree, 2);
        // a, b, c import but are not imported — in-degree 0
        const nonCoreEntries = ranked.filter(r => r.inDegree === 0);
        assert.equal(nonCoreEntries.length, 3);
    });

    test("resolves import without extension (.js added)", () => {
        const files = [
            makeFile("src/db.js",     "export const db = {};"),
            makeFile("src/model.js",  `import db from "./db";`), // no .js extension
        ];
        const ranked = rankByInDegree(files);
        const dbEntry = ranked.find(r => r.path === "src/db.js");
        assert.equal(dbEntry.inDegree, 1);
    });

    test("resolves parent directory traversal (../)", () => {
        const files = [
            makeFile("src/config.js",       "export const config = {};"),
            makeFile("src/routes/auth.js",  `import config from "../config.js";`),
        ];
        const ranked = rankByInDegree(files);
        const configEntry = ranked.find(r => r.path === "src/config.js");
        assert.equal(configEntry.inDegree, 1);
    });

    test("ignores node_modules imports (non-relative)", () => {
        const files = [
            makeFile("src/a.js", `import express from "express"; import dotenv from "dotenv";`),
            makeFile("src/b.js", "export const x = 1;"),
        ];
        const ranked = rankByInDegree(files);
        // express and dotenv are not in our file list — in-degrees should all be 0
        for (const entry of ranked) {
            assert.equal(entry.inDegree, 0);
        }
    });

    test("skips .json files for import scanning", () => {
        const files = [
            makeFile("package.json", `{"main": "src/index.js"}`, ".json"),
            makeFile("src/index.js", "export default {};"),
        ];
        const ranked = rankByInDegree(files);
        // package.json should not contribute to any in-degree
        const indexEntry = ranked.find(r => r.path === "src/index.js");
        assert.equal(indexEntry.inDegree, 0);
    });
});

// ── selectTopFiles tests ───────────────────────────────────────────────────

describe("selectTopFiles", () => {
    test("returns all files when count <= topN", () => {
        const files = [
            makeFile("src/a.js", ""),
            makeFile("src/b.js", ""),
        ];
        const result = selectTopFiles(files, 10);
        assert.equal(result.length, 2);
    });

    test("returns exactly topN files when count > topN", () => {
        const files = [
            makeFile("src/utils.js",   "export const x = 1;"),
            makeFile("src/config.js",  "export const c = 2;"),
            makeFile("src/a.js",       `import "./utils.js"; import "./config.js";`),
            makeFile("src/b.js",       `import "./utils.js";`),
            makeFile("src/c.js",       `import "./config.js";`),
        ];
        const result = selectTopFiles(files, 2);
        assert.equal(result.length, 2);
    });

    test("the selected files are the ones with highest in-degree", () => {
        const files = [
            makeFile("src/utils.js",   "export const x = 1;"),   // in-degree 2
            makeFile("src/config.js",  "export const c = 2;"),   // in-degree 2
            makeFile("src/unused.js",  "const z = 3;"),           // in-degree 0
            makeFile("src/a.js",       `import "./utils.js"; import "./config.js";`),
            makeFile("src/b.js",       `import "./config.js";`),
        ];
        const result = selectTopFiles(files, 2);
        const selectedPaths = new Set(result.map(f => f.path));
        // The two highest in-degree files should be selected
        // (utils and config have in-degree 2, the rest have 0)
        assert.ok(
            selectedPaths.has("src/utils.js") || selectedPaths.has("src/config.js"),
            "Expected high-in-degree files to be selected"
        );
        assert.ok(!selectedPaths.has("src/unused.js"), "Expected unused.js to be excluded");
    });

    test("returns empty array for empty input", () => {
        assert.deepEqual(selectTopFiles([], 5), []);
        assert.deepEqual(selectTopFiles(null, 5), []);
    });
});
