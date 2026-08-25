/**
 * Route Analyzer — route.analyzer.js
 *
 * Extracts structured HTTP route descriptors from JavaScript/TypeScript route files.
 * Supports Express router aliases, chained routes (router.route), and paren-depth token scanning.
 */

import {
    stripComments,
    findClosingParen,
    unquote,
} from "./utils/scanner.utils.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point called by repository.analyzer.js
 *
 * Accepts the full repository object and returns a flat array of route
 * descriptors gathered from every route file in the repository.
 *
 * @param {object} repository
 * @returns {Array<object>} Route descriptors
 */
export const analyzeRoutes = (repository) => {
    const routeFiles = (repository?.files || []).filter(file => isRouteFile(file));

    const routes = [];
    const parseErrors = [];

    for (const file of routeFiles) {
        const { routes: fileRoutes, errors: fileErrors } = parseRouteFile(file);
        routes.push(...fileRoutes);
        if (fileErrors.length > 0) parseErrors.push(...fileErrors);
    }

    analyzeRoutes._lastParseErrors = parseErrors;
    return routes;
};

// ─────────────────────────────────────────────────────────────────────────────
// File Detection & Parsing
// ─────────────────────────────────────────────────────────────────────────────

function isRouteFile(file) {
    const cat = (file.category || "").toLowerCase();
    const p   = (file.path || "").replace(/\\/g, "/").toLowerCase();

    if (cat === "routes" || cat === "route") return true;
    if (p.includes("/routes/"))               return true;
    if (/\.routes?\.js$/.test(p))             return true;

    return false;
}

function parseRouteFile(file) {
    const routes = [];
    const errors = [];

    try {
        const clean = stripComments(file.content);
        const routerAliases = detectRouterAliases(clean);

        // 1. Collect chained routes: router.route("/path").get(...).post(...)
        routes.push(...parseChainedRoutes(clean, file.path, routerAliases));

        // 2. Collect simple routes: router.get("/path", mw1, mw2, controller)
        routes.push(...parseSimpleRoutes(clean, file.path, routerAliases));
    } catch (err) {
        errors.push({ file: file.path, error: err.message });
    }

    return { routes, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Router Alias Detection
// ─────────────────────────────────────────────────────────────────────────────

function detectRouterAliases(source) {
    const aliases = new Set(["router", "app", "route"]);
    const regex = /(?:const|let|var)\s+([\w$]+)\s*=\s*(?:express\s*\.\s*)?Router\s*\(/g;
    let match;

    while ((match = regex.exec(source)) !== null) {
        aliases.add(match[1]);
    }

    return aliases;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Route Parser (router.get, router.post, ...)
// ─────────────────────────────────────────────────────────────────────────────

function parseSimpleRoutes(source, filePath, routerAliases) {
    const routes = [];
    const aliasPattern = Array.from(routerAliases).join("|");
    const methodsPattern = HTTP_METHODS.join("|");
    const regex = new RegExp(`(?:${aliasPattern})\\s*\\.\\s*(${methodsPattern})\\s*\\(`, "g");

    let match;
    while ((match = regex.exec(source)) !== null) {
        const method = match[1].toLowerCase();
        const openParenIndex = match.index + match[0].length - 1;
        const closeParenIndex = findClosingParen(source, openParenIndex);

        if (closeParenIndex === -1) continue;

        const argsString = source.slice(openParenIndex + 1, closeParenIndex);
        const args = splitTopLevelArgs(argsString);
        if (args.length < 2) continue;

        const rawPath = unquote(args[0]);
        if (!rawPath.startsWith("/")) continue;

        const handlerTokens = args.slice(1);
        const line = countLines(source, match.index);
        const route = buildRoute(method.toUpperCase(), rawPath, handlerTokens, filePath, line);

        if (route) routes.push(route);
    }

    return routes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chained Route Parser (router.route("/path").get(...).post(...))
// ─────────────────────────────────────────────────────────────────────────────

function parseChainedRoutes(source, filePath, routerAliases) {
    const routes = [];
    const aliasPattern = Array.from(routerAliases).join("|");
    const regex = new RegExp(`(?:${aliasPattern})\\s*\\.\\s*route\\s*\\(`, "g");

    let match;
    while ((match = regex.exec(source)) !== null) {
        const openParenIndex = match.index + match[0].length - 1;
        const closeParenIndex = findClosingParen(source, openParenIndex);

        if (closeParenIndex === -1) continue;

        const pathArg = source.slice(openParenIndex + 1, closeParenIndex);
        const rawPath = unquote(pathArg.trim());
        if (!rawPath.startsWith("/")) continue;

        const line = countLines(source, match.index);
        const chainTail = source.slice(closeParenIndex + 1);
        const chainCalls = extractChainedMethodCalls(chainTail);

        for (const { method, argsString } of chainCalls) {
            const handlerTokens = splitTopLevelArgs(argsString);
            if (handlerTokens.length === 0) continue;

            const route = buildRoute(method.toUpperCase(), rawPath, handlerTokens, filePath, line);
            if (route) routes.push(route);
        }
    }

    return routes;
}

function extractChainedMethodCalls(tail) {
    const calls = [];
    let i = 0;

    while (i < tail.length) {
        while (i < tail.length && /\s/.test(tail[i])) i++;
        if (tail[i] !== ".") break;
        i++;

        const methodMatch = /^[a-zA-Z]+/.exec(tail.slice(i));
        if (!methodMatch) break;

        const method = methodMatch[0].toLowerCase();
        i += method.length;

        while (i < tail.length && /\s/.test(tail[i])) i++;
        if (tail[i] !== "(") break;

        const openParen = i;
        const closeParen = findClosingParen(tail, openParen);
        if (closeParen === -1) break;

        if (HTTP_METHODS.includes(method)) {
            calls.push({
                method,
                argsString: tail.slice(openParen + 1, closeParen),
            });
        }

        i = closeParen + 1;
    }

    return calls;
}

// ─────────────────────────────────────────────────────────────────────────────
// Argument Splitting & Token Classification
// ─────────────────────────────────────────────────────────────────────────────

function splitTopLevelArgs(argsString) {
    const args = [];
    let depth = 0;
    let inStr = null;
    let current = "";

    for (let i = 0; i < argsString.length; i++) {
        const ch = argsString[i];

        if (inStr && ch === "\\" && i + 1 < argsString.length) {
            current += ch + argsString[i + 1];
            i++;
            continue;
        }

        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) inStr = null;
            else if (!inStr) inStr = ch;
            current += ch;
            continue;
        }

        if (inStr) {
            current += ch;
            continue;
        }

        if (ch === "(" || ch === "[" || ch === "{") {
            depth++;
            current += ch;
            continue;
        }

        if (ch === ")" || ch === "]" || ch === "}") {
            depth--;
            current += ch;
            continue;
        }

        if (ch === "," && depth === 0 && !inStr) {
            const trimmed = current.trim();
            if (trimmed) args.push(trimmed);
            current = "";
            continue;
        }

        current += ch;
    }

    const trimmed = current.trim();
    if (trimmed) args.push(trimmed);

    return args;
}

function buildRoute(method, routePath, handlerTokens, filePath, line) {
    if (!routePath || handlerTokens.length === 0) return null;

    const cleanTokens = handlerTokens
        .map(t => t.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    if (cleanTokens.length === 0) return null;

    const rawController = cleanTokens[cleanTokens.length - 1];
    const controller = unwrapWrapAsync(rawController);
    const middlewares = cleanTokens
        .slice(0, cleanTokens.length - 1)
        .map(t => t.replace(/\s+/g, " ").trim());

    return {
        method,
        path: routePath,
        controller,
        middlewares,
        source: {
            file: filePath,
            line: line || null,
        },
        file: filePath,
    };
}

function unwrapWrapAsync(token) {
    const match = /^wrapAsync\s*\(\s*([\s\S]+?)\s*\)$/.exec(token);
    return match ? match[1].trim() : token;
}

function countLines(source, index) {
    return source.slice(0, index).split("\n").length;
}