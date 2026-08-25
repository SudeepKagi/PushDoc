import * as parser from "@babel/parser";
import traverseModule from "@babel/traverse";

// Handle default/ESM import variations for @babel/traverse
const traverse = traverseModule.default || traverseModule;

/**
 * AST Analyzer V2
 *
 * WHAT CHANGED FROM V1
 * ────────────────────
 * V1 limitations:
 *   1. Express route detection only matched hardcoded names: "router", "app", "route".
 *      Any alias like `userRouter`, `api`, or `v1` was silently skipped.
 *   2. Axios detection only matched `axios.get()` where the callee object was
 *      literally named "axios". An `axios.create()` alias like `client.get()`
 *      was completely missed.
 *   3. Parse errors were silently swallowed — no visibility into which files
 *      failed to parse and why.
 *
 * V2 improvements:
 *   1. IMPORT/BINDING TABLE: Built before traversal. Records which local
 *      variable names are bound to Express Router or axios instances.
 *      e.g.: `import { Router } from "express"; const api = Router();`
 *      → binding table: { api: "express-router" }
 *      Now `api.get(...)` is correctly recognized as an Express route.
 *
 *   2. AXIOS ALIAS TRACKING: `const client = axios.create(...)` is tracked.
 *      Subsequent `client.get("/users")` is correctly identified as an axios call.
 *
 *   3. PARSE ERROR COLLECTION: Errors are collected into a `parseErrors` array
 *      and returned in the result. The job never fails because of one bad file,
 *      but callers now have full visibility.
 *
 *   4. SOURCE LINE NUMBERS: Every extracted fact includes the line number it
 *      was found on. This enables traceability and richer AI prompts.
 *
 *   5. FILE PRIORITIZATION: High-signal directories (routes/, controllers/,
 *      services/, models/) are processed first. Low-signal directories
 *      (dist/, build/, coverage/) are skipped.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

// Directories to skip entirely — they contain no useful architectural facts
const SKIP_DIRS = new Set([
    "node_modules", "dist", "build", ".next", "out", "coverage",
    ".git", ".cache", "vendor", "__pycache__", ".turbo",
]);

// High-signal directories — processed before generic source files
const HIGH_SIGNAL_PATTERNS = [
    /\/routes?\//i,
    /\/controllers?\//i,
    /\/services?\//i,
    /\/models?\//i,
    /\/api\//i,
    /\/middleware\//i,
    /\/handlers?\//i,
];

const HTTP_METHODS = new Set(["get", "post", "put", "delete", "patch", "options", "head", "all", "use"]);

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses JavaScript/TypeScript source code into an AST and extracts
 * deterministic architectural facts with binding-aware analysis.
 *
 * @returns {{
 *   apiCalls: Array,
 *   expressRoutes: Array,
 *   envVars: string[],
 *   envFileVars: Array,
 *   parseErrors: Array,
 *   filesAnalyzed: number,
 *   filesFailed: number,
 * }}
 */
export const analyzeAst = (repository) => {
    const apiCalls    = [];
    const expressRoutes = [];
    const envVars     = new Set();
    const envFileVars = [];
    const parseErrors = [];
    let filesAnalyzed = 0;
    let filesFailed   = 0;

    // ── 1. Process .env.example / .env.sample ────────────────────────────────
    for (const file of repository.files || []) {
        const basename = file.path.split(/[/\\]/).pop().toLowerCase();
        if (basename === ".env.example" || basename === ".env.sample" || basename === ".env.template") {
            const lines = file.content.split("\n");
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith("#")) {
                    const eqIdx = trimmed.indexOf("=");
                    const key   = eqIdx !== -1 ? trimmed.substring(0, eqIdx).trim() : trimmed;
                    if (key) {
                        envFileVars.push({ key, sourceFile: file.path });
                        envVars.add(key);
                    }
                }
            }
        }
    }

    // ── 2. Prioritize and filter source files ─────────────────────────────────
    const sourceFiles = (repository.files || []).filter(file => {
        const ext  = (file.extension || "").toLowerCase();
        if (!SOURCE_EXTENSIONS.has(ext)) return false;

        // Skip files in low-signal directories
        const normalizedPath = file.path.replace(/\\/g, "/");
        const parts = normalizedPath.split("/");
        if (parts.some(p => SKIP_DIRS.has(p))) return false;

        // Skip minified files
        if (/\.min\.(js|ts)$/.test(normalizedPath)) return false;

        return true;
    });

    // Sort: high-signal directories first for better fact density in early analysis
    sourceFiles.sort((a, b) => {
        const aHigh = HIGH_SIGNAL_PATTERNS.some(p => p.test(a.path));
        const bHigh = HIGH_SIGNAL_PATTERNS.some(p => p.test(b.path));
        if (aHigh && !bHigh) return -1;
        if (!aHigh && bHigh) return  1;
        return 0;
    });

    // ── 3. Parse each file ────────────────────────────────────────────────────
    for (const file of sourceFiles) {
        const ext = (file.extension || "").toLowerCase();

        try {
            const plugins = [
                "jsx",
                "asyncGenerators",
                "classProperties",
                "dynamicImport",
                "objectRestSpread",
                "optionalChaining",
                "nullishCoalescingOperator",
                "decorators-legacy",
            ];
            if (ext === ".ts" || ext === ".tsx") {
                plugins.push("typescript");
            }

            const ast = parser.parse(file.content, {
                sourceType:                  "module",
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction:  true,
                plugins,
            });

            filesAnalyzed++;

            // ── Phase A: Build import/binding table for this file ─────────────
            // This runs before the main traversal so that subsequent
            // CallExpression checks can resolve aliases like:
            //   import { Router } from "express"   → api = Router()  → api.get()
            //   import axios from "axios"           → client = axios.create() → client.get()
            const bindings = buildBindingTable(ast);

            // ── Phase B: Main AST traversal ───────────────────────────────────
            traverse(ast, {

                // A. Extract axios/fetch/custom-client call sites
                CallExpression(path) {
                    const node   = path.node;
                    const callee = node.callee;
                    const line   = node.loc?.start?.line;

                    // ── fetch("URL") ──────────────────────────────────────────
                    if (callee.type === "Identifier" && callee.name === "fetch") {
                        const url = extractUrlString(node.arguments[0]);
                        if (url) {
                            apiCalls.push({
                                method: "GET/POST",
                                url,
                                client: "fetch",
                                file:   file.path,
                                line,
                            });
                        }
                        return;
                    }

                    if (callee.type === "MemberExpression") {
                        const objNode  = callee.object;
                        const propNode = callee.property;

                        const objName  = objNode.type  === "Identifier" ? objNode.name  : null;
                        const propName = propNode.type === "Identifier" ? propNode.name : null;

                        if (!objName || !propName) return;

                        const boundTo = bindings[objName]; // what is this name bound to?

                        // ── axios.get() or aliased axios client ───────────────
                        const isAxiosDirect = objName === "axios";
                        const isAxiosAlias  = boundTo === "axios" || boundTo === "axios.create";
                        if ((isAxiosDirect || isAxiosAlias) && ["get","post","put","delete","patch","request"].includes(propName.toLowerCase())) {
                            const url = extractUrlString(node.arguments[0]);
                            if (url) {
                                apiCalls.push({
                                    method: propName.toUpperCase(),
                                    url,
                                    client: "axios",
                                    file:   file.path,
                                    line,
                                });
                            }
                            return;
                        }

                        // ── Express route: router.get("/path", ...) ───────────
                        // Accepts: literal "router"/"app"/"route" AND any alias
                        // that is bound to an Express Router in the binding table
                        const isKnownRouterName = ["router", "app", "route"].includes(objName.toLowerCase());
                        const isBoundToRouter   = boundTo === "express-router";

                        if ((isKnownRouterName || isBoundToRouter) && HTTP_METHODS.has(propName.toLowerCase())) {
                            const firstArg = node.arguments[0];
                            if (firstArg && firstArg.type === "StringLiteral") {
                                expressRoutes.push({
                                    method: propName.toUpperCase(),
                                    path:   firstArg.value,
                                    file:   file.path,
                                    line,
                                });
                            }
                        }
                    }
                },

                // B. Extract process.env.VARIABLE_NAME
                MemberExpression(path) {
                    const node = path.node;
                    if (
                        node.object.type                 === "MemberExpression" &&
                        node.object.object.type          === "Identifier"       &&
                        node.object.object.name          === "process"          &&
                        node.object.property.type        === "Identifier"       &&
                        node.object.property.name        === "env"              &&
                        node.property.type               === "Identifier"
                    ) {
                        envVars.add(node.property.name);
                    }
                },
            });

        } catch (error) {
            filesFailed++;
            parseErrors.push({
                file:    file.path,
                error:   error.message,
                // Never fail the whole job over one file — just record the error
            });
        }
    }

    return {
        apiCalls,
        expressRoutes,
        envVars:       Array.from(envVars),
        envFileVars,
        parseErrors,
        filesAnalyzed,
        filesFailed,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Binding table builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single-pass AST walk to build a local variable → package binding table.
 *
 * Tracks:
 *   import express from "express"         → { express: "express" }
 *   import { Router } from "express"      → { Router: "express-router-constructor" }
 *   const router = express.Router()       → { router: "express-router" }
 *   const api    = Router()               → { api:    "express-router" }
 *   import axios from "axios"             → { axios:  "axios" }
 *   const client = axios.create(...)      → { client: "axios.create" }
 *
 * @param {object} ast  Babel AST root
 * @returns {object}    { localName: bindingType }
 */
function buildBindingTable(ast) {
    const table = {};

    try {
        traverse(ast, {

            // ── ESM imports ───────────────────────────────────────────────────
            ImportDeclaration(path) {
                const source = path.node.source.value;

                for (const spec of path.node.specifiers) {
                    const localName = spec.local.name;

                    if (source === "express") {
                        if (spec.type === "ImportDefaultSpecifier") {
                            // import express from "express"
                            table[localName] = "express";
                        } else if (
                            spec.type === "ImportSpecifier" &&
                            (spec.imported.name === "Router" || spec.imported.name === "router")
                        ) {
                            // import { Router } from "express"
                            table[localName] = "express-router-constructor";
                        }
                    }

                    if (source === "axios") {
                        if (spec.type === "ImportDefaultSpecifier") {
                            // import axios from "axios"
                            table[localName] = "axios";
                        }
                    }
                }
            },

            // ── CJS require ───────────────────────────────────────────────────
            VariableDeclarator(path) {
                const init = path.node.init;
                const id   = path.node.id;
                if (!init || id.type !== "Identifier") return;

                const name = id.name;

                // const express = require("express")
                if (
                    init.type === "CallExpression" &&
                    init.callee.type === "Identifier" &&
                    init.callee.name === "require" &&
                    init.arguments[0]?.type === "StringLiteral"
                ) {
                    const pkg = init.arguments[0].value;
                    if (pkg === "express") { table[name] = "express"; return; }
                    if (pkg === "axios")   { table[name] = "axios";   return; }
                }

                // const router = express.Router()
                if (
                    init.type === "CallExpression" &&
                    init.callee.type === "MemberExpression" &&
                    init.callee.object.type === "Identifier" &&
                    table[init.callee.object.name] === "express" &&
                    init.callee.property.type === "Identifier" &&
                    init.callee.property.name === "Router"
                ) {
                    table[name] = "express-router";
                    return;
                }

                // const api = Router()   (named import)
                if (
                    init.type === "CallExpression" &&
                    init.callee.type === "Identifier" &&
                    table[init.callee.name] === "express-router-constructor"
                ) {
                    table[name] = "express-router";
                    return;
                }

                // const client = axios.create(...)
                if (
                    init.type === "CallExpression" &&
                    init.callee.type === "MemberExpression" &&
                    init.callee.object.type === "Identifier" &&
                    (init.callee.object.name === "axios" || table[init.callee.object.name] === "axios") &&
                    init.callee.property.type === "Identifier" &&
                    init.callee.property.name === "create"
                ) {
                    table[name] = "axios.create";
                    return;
                }
            },
        });
    } catch {
        // Binding table construction is best-effort — if it fails on malformed
        // code the main traversal will still run with an empty table.
    }

    return table;
}

// ─────────────────────────────────────────────────────────────────────────────
// String extraction helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts a string or template literal representation from an AST node.
 */
function extractUrlString(node) {
    if (!node) return null;

    if (node.type === "StringLiteral") {
        return node.value;
    }

    if (node.type === "TemplateLiteral") {
        let result = "";
        for (let i = 0; i < node.quasis.length; i++) {
            result += node.quasis[i].value.raw;
            if (i < node.expressions.length) {
                const expr = node.expressions[i];
                if (expr.type === "Identifier") {
                    result += `\${${expr.name}}`;
                } else {
                    result += "${...}";
                }
            }
        }
        return result;
    }

    return null;
}
