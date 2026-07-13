/**
 * Route Analyzer V2
 *
 * WHY THIS EXISTS
 * ───────────────
 * The AI cannot generate a useful API Overview section in the README
 * if it only receives raw route file source code. By extracting a
 * structured list of { method, path, controller, middlewares } objects,
 * we give the prompt builder a clean, token-efficient representation
 * of every endpoint — no raw source required.
 *
 * WHY THIS DESIGN (paren-depth scanner)
 * ──────────────────────────────────────
 * V1 split arguments on commas and used a lazy `.*?` regex to find
 * the end of a route call. Both approaches shatter on real Express code:
 *
 *   router.post(
 *       "/",
 *       isLoggedIn,
 *       upload.single("listing[image]"),          ← comma inside string
 *       validateListing,
 *       wrapAsync(listingController.createListing) ← nested parens
 *   );
 *
 *   passport.authenticate("local", {              ← nested object literal
 *       failureRedirect: "/login",
 *       failureFlash: true,
 *   })
 *
 * The fix is a lightweight character-level scanner that tracks:
 *   • paren depth  ()
 *   • bracket depth []
 *   • brace depth  {}
 *   • quote state  "  '  `
 *
 * We split on commas only when all depths are 0 and we are outside
 * a string. This is the minimal amount of parsing needed to correctly
 * handle every real-world Express middleware pattern without pulling
 * in Babel, Acorn, or any AST library.
 *
 * FUTURE SCALABILITY
 * ──────────────────
 * The same scanner is reusable for the Controller Analyzer and the
 * Model Analyzer. When we eventually add TypeScript support, we only
 * need to add decorator patterns on top of this foundation.
 * If we ever need full AST parsing we can swap in Acorn behind this
 * same interface without touching the pipeline or context builder.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"];

// Middleware tokens that are never the controller (always middleware)
const KNOWN_MIDDLEWARE_PATTERNS = [
    /^isLoggedIn$/,
    /^isOwner$/,
    /^isReviewAuthor$/,
    /^saveRedirectUrl$/,
    /^validateListing$/,
    /^validateReview$/,
    /^authMiddleware$/,
    /^upload\./,
    /^passport\./,
    /^multer/,
    /^wrapAsync\s*\(/,
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point called by repository.analyzer.js
 *
 * Accepts the full repository object and returns a flat array of route
 * descriptors gathered from every file whose category is "routes" or
 * whose path contains a "route" segment.
 */
export const analyzeRoutes = (repository) => {

    const routeFiles = repository.files.filter(
        (file) => isRouteFile(file)
    );

    const routes = [];

    for (const file of routeFiles) {
        const fileRoutes = parseRouteFile(file);
        routes.push(...fileRoutes);
    }

    return routes;

};

// ─────────────────────────────────────────────────────────────────────────────
// File detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines whether a file is likely a route file.
 *
 * We accept:
 *   category === "routes"    (flat structure: routes/listing.js)
 *   category === "route"     (alternative singular)
 *   path contains /routes/   (nested: src/routes/listing.js)
 *   filename ends with .route.js or .routes.js
 */
function isRouteFile(file) {

    const cat = (file.category || "").toLowerCase();
    const p   = (file.path || "").replace(/\\/g, "/").toLowerCase();

    if (cat === "routes" || cat === "route") return true;
    if (p.includes("/routes/"))               return true;
    if (/\.routes?\.js$/.test(p))             return true;

    return false;

}

// ─────────────────────────────────────────────────────────────────────────────
// File-level parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseRouteFile(file) {

    const routes = [];

    // 1. Strip comments so we never match routes inside commented-out code
    const clean = stripComments(file.content);

    // 2. Collect chained routes first: router.route("/path").get(...).post(...)
    routes.push(...parseChainedRoutes(clean, file.path));

    // 3. Collect simple routes: router.get("/path", mw1, mw2, controller)
    routes.push(...parseSimpleRoutes(clean, file.path));

    return routes;

}

// ─────────────────────────────────────────────────────────────────────────────
// Comment stripping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Removes // line comments and block comments from source.
 * Preserves string contents — we do not strip inside string literals.
 *
 * This prevents the route scanner from matching:
 *   // router.get("/old", ...)
 *   (block comment) router.post("/disabled", ...) (end block comment)
 */
function stripComments(source) {

    let result = "";
    let i      = 0;
    let inStr  = null; // null | '"' | "'" | "`"

    while (i < source.length) {

        const ch   = source[i];
        const next = source[i + 1];

        // ── Inside a string ──────────────────────────────────────────────────
        if (inStr) {

            if (ch === "\\" && i + 1 < source.length) {
                // Escaped character — copy both and skip
                result += ch + source[i + 1];
                i += 2;
                continue;
            }

            if (ch === inStr) {
                inStr = null;
            }

            result += ch;
            i++;
            continue;

        }

        // ── String start ─────────────────────────────────────────────────────
        if (ch === '"' || ch === "'" || ch === "`") {
            inStr = ch;
            result += ch;
            i++;
            continue;
        }

        // ── Line comment ─────────────────────────────────────────────────────
        if (ch === "/" && next === "/") {
            while (i < source.length && source[i] !== "\n") i++;
            continue;
        }

        // ── Block comment ────────────────────────────────────────────────────
        if (ch === "/" && next === "*") {
            i += 2;
            while (i + 1 < source.length) {
                if (source[i] === "*" && source[i + 1] === "/") {
                    i += 2;
                    break;
                }
                i++;
            }
            continue;
        }

        result += ch;
        i++;

    }

    return result;

}

// ─────────────────────────────────────────────────────────────────────────────
// Chained route parser  —  router.route("/").get(...).post(...)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds every  router.route("path")  in the source, then walks the
 * method chain that follows it (.get(...).post(...) etc.) using the
 * paren-depth scanner to correctly delimit each call's argument list.
 */
function parseChainedRoutes(source, filePath) {

    const routes = [];

    // Match the anchor: router.route( OR router\n    .route(
    // \s allows newlines in JS regex, so this handles multi-line chains.
    const anchorRegex = /\brouter\s*\.\s*route\s*\(/gi;

    let match;

    while ((match = anchorRegex.exec(source)) !== null) {

        // Find the closing paren of  .route("path")
        const openParen = match.index + match[0].length - 1; // position of (
        const closeOfRoute = findClosingParen(source, openParen);

        if (closeOfRoute === -1) continue;

        // Extract the path argument (everything between the parens)
        const rawPathArg = source.slice(openParen + 1, closeOfRoute).trim();
        const routePath  = unquote(rawPathArg);

        // Walk the chain after  .route("path")
        let cursor = closeOfRoute + 1;

        // Collect .METHOD(...) calls in the chain
        const chainMethodRegex = /^\s*\.\s*(get|post|put|delete|patch)\s*\(/i;

        while (cursor < source.length) {

            // Skip whitespace and newlines
            const remaining = source.slice(cursor);
            const methodMatch = chainMethodRegex.exec(remaining);

            if (!methodMatch) break;

            const method = methodMatch[1].toUpperCase();

            // Position of the opening paren of this method call
            const methodOpenIdx = cursor + methodMatch.index + methodMatch[0].length - 1;

            const methodClose = findClosingParen(source, methodOpenIdx);
            if (methodClose === -1) break;

            const argsRaw = source.slice(methodOpenIdx + 1, methodClose);
            const args    = splitArgs(argsRaw);

            const route = buildRoute(method, routePath, args, filePath);
            if (route) routes.push(route);

            cursor = methodClose + 1;

        }

    }

    return routes;

}

// ─────────────────────────────────────────────────────────────────────────────
// Simple route parser  —  router.get("/path", mw1, controller)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds every  router.METHOD(  call in the source and extracts its
 * full argument list using the paren-depth scanner.
 *
 * We intentionally skip calls that are already captured by
 * parseChainedRoutes by checking whether the call is preceded by
 * a closing paren (part of a chain like .route("/").get(...)).
 */
function parseSimpleRoutes(source, filePath) {

    const routes = [];

    const methodPattern = HTTP_METHODS.join("|");
    // Allow optional whitespace (including newlines) between router and .METHOD(
    const anchorRegex = new RegExp(
        `\\brouter\\s*\\.\\s*(${methodPattern})\\s*\\(`,
        "gi"
    );

    let match;

    while ((match = anchorRegex.exec(source)) !== null) {

        // Skip if this METHOD call is part of a .route() chain.
        // We look at the text between the last semicolon and this match:
        // if it contains .route( then this call is chained — skip.
        const before = source.slice(0, match.index);
        const lastSemi = before.lastIndexOf(";");
        const searchRegion = before.slice(lastSemi + 1);
        if (beforeEndsWithChainedRoute(searchRegion)) continue;

        const method   = match[1].toUpperCase();
        const openIdx  = match.index + match[0].length - 1; // position of (
        const closeIdx = findClosingParen(source, openIdx);

        if (closeIdx === -1) continue;

        const argsRaw = source.slice(openIdx + 1, closeIdx);
        const args    = splitArgs(argsRaw);

        if (args.length < 2) continue; // must have at least path + handler

        const routePath = unquote(args[0]);
        const route     = buildRoute(method, routePath, args.slice(1), filePath);

        if (route) routes.push(route);

    }

    return routes;

}

/**
 * Returns true if the given source region (text between the last ; and the
 * current match position) contains a .route( call, meaning the current
 * .METHOD() call is part of a chained route definition.
 */
function beforeEndsWithChainedRoute(region) {
    return /\.\s*route\s*\(/.test(region);
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: paren-depth argument splitter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits a raw argument string on top-level commas only.
 *
 * "Top-level" means: not inside (), [], {}, or a string literal.
 *
 * Examples that V1 split incorrectly (all work correctly here):
 *
 *   upload.single("listing[image]")
 *   passport.authenticate("local", { failureRedirect: "/login" })
 *   wrapAsync(listingController.createListing)
 *
 * @param  {string} raw  Everything between the outer parens of a route call
 * @returns {string[]}   Trimmed, non-empty argument tokens
 */
function splitArgs(raw) {

    const args  = [];
    let current = "";
    let depth   = 0;       // tracks () [] {}
    let inStr   = null;    // null | '"' | "'" | "`"

    for (let i = 0; i < raw.length; i++) {

        const ch   = raw[i];
        const next = raw[i + 1];

        // ── Escape sequences inside strings ──────────────────────────────────
        if (inStr && ch === "\\" && i + 1 < raw.length) {
            current += ch + raw[i + 1];
            i++;
            continue;
        }

        // ── String boundaries ─────────────────────────────────────────────────
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) {
                inStr = null;
            } else if (!inStr) {
                inStr = ch;
            }
            current += ch;
            continue;
        }

        // ── Inside a string: accumulate verbatim ──────────────────────────────
        if (inStr) {
            current += ch;
            continue;
        }

        // ── Depth tracking ────────────────────────────────────────────────────
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

        // ── Top-level comma → argument boundary ──────────────────────────────
        if (ch === "," && depth === 0 && !inStr) {
            const trimmed = current.trim();
            if (trimmed) args.push(trimmed);
            current = "";
            continue;
        }

        current += ch;

    }

    // Push the final argument
    const trimmed = current.trim();
    if (trimmed) args.push(trimmed);

    return args;

}

// ─────────────────────────────────────────────────────────────────────────────
// Core: find matching closing paren
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given the index of an opening paren in source, returns the index of
 * the matching closing paren, correctly handling nested parens and strings.
 *
 * Returns -1 if no match is found (malformed source).
 */
function findClosingParen(source, openIndex) {

    let depth = 0;
    let inStr = null;

    for (let i = openIndex; i < source.length; i++) {

        const ch = source[i];

        // Escape inside string
        if (inStr && ch === "\\" && i + 1 < source.length) {
            i++;
            continue;
        }

        // String boundaries
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) {
                inStr = null;
            } else if (!inStr) {
                inStr = ch;
            }
            continue;
        }

        if (inStr) continue;

        if (ch === "(") { depth++; continue; }
        if (ch === ")") {
            depth--;
            if (depth === 0) return i;
        }

    }

    return -1;

}

// ─────────────────────────────────────────────────────────────────────────────
// Route builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given a method, a path, and an ordered list of handler tokens,
 * classifies each token as either a middleware or the controller.
 *
 * Classification logic:
 *   • The LAST token is always treated as the controller.
 *   • All tokens before the last are middlewares.
 *   • Controller is unwrapped from wrapAsync(...) if present.
 *   • Middleware tokens are normalised (whitespace collapsed).
 *
 * This is intentionally simple: the AI does not need perfect
 * classification — it needs a clean, human-readable summary.
 */
function buildRoute(method, routePath, handlerTokens, filePath) {

    if (!routePath || handlerTokens.length === 0) return null;

    const cleanTokens = handlerTokens
        .map((t) => t.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    if (cleanTokens.length === 0) return null;

    // Last token is the controller
    const rawController = cleanTokens[cleanTokens.length - 1];
    const controller    = unwrapWrapAsync(rawController);

    // Everything before the last token is middleware
    const middlewares = cleanTokens
        .slice(0, cleanTokens.length - 1)
        .map(normaliseMiddleware);

    return {
        method,
        path:        routePath,
        controller,
        middlewares,
        file:        filePath,
    };

}

// ─────────────────────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Removes surrounding quotes from a string literal token.
 * Handles:  "value"  'value'  `value`
 */
function unquote(token) {
    const t = token.trim();
    if (
        (t.startsWith('"')  && t.endsWith('"'))  ||
        (t.startsWith("'")  && t.endsWith("'"))  ||
        (t.startsWith("`")  && t.endsWith("`"))
    ) {
        return t.slice(1, -1);
    }
    return t;
}

/**
 * Strips the `wrapAsync(` wrapper and trailing `)` from a controller token.
 *
 * Input:  wrapAsync(listingController.createListing)
 * Output: listingController.createListing
 */
function unwrapWrapAsync(token) {
    const match = /^wrapAsync\s*\(\s*([\s\S]+?)\s*\)$/.exec(token);
    return match ? match[1].trim() : token;
}

/**
 * Normalises a middleware token for display in the README.
 * Collapses whitespace but preserves the full call expression,
 * including any arguments (so `upload.single("image")` stays intact).
 */
function normaliseMiddleware(token) {
    return token.replace(/\s+/g, " ").trim();
}