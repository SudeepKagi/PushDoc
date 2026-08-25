/**
 * Lexical Scanner & String Utilities — scanner.utils.js
 *
 * Provides character-level depth-tracking scanners and string-aware
 * comment stripping for code analyzers (e.g. model.analyzer, route.analyzer).
 *
 * Correctly handles:
 *   • Single-line (//) and multi-line (/*...*\/) comments
 *   • String literals with escaped quotes ("", '', ``)
 *   • Nested parentheses, braces, and brackets at arbitrary depth
 */

/**
 * Strips single-line and multi-line comments from JavaScript/TypeScript source code
 * while preserving string literals containing comment tokens (e.g. "http://").
 *
 * @param {string} source
 * @returns {string} Clean source without comments
 */
export function stripComments(source) {
    if (!source) return "";

    let result = "";
    let i = 0;
    let inStr = null;

    while (i < source.length) {
        const ch = source[i];
        const next = source[i + 1];

        // ── String escape handling ───────────────────────────────────────────
        if (inStr) {
            if (ch === "\\" && i + 1 < source.length) {
                result += ch + source[i + 1];
                i += 2;
                continue;
            }
            if (ch === inStr) inStr = null;
            result += ch;
            i++;
            continue;
        }

        // ── String delimiter start ───────────────────────────────────────────
        if (ch === '"' || ch === "'" || ch === "`") {
            inStr = ch;
            result += ch;
            i++;
            continue;
        }

        // ── Single-line comment ──────────────────────────────────────────────
        if (ch === "/" && next === "/") {
            while (i < source.length && source[i] !== "\n") i++;
            continue;
        }

        // ── Multi-line comment ───────────────────────────────────────────────
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

/**
 * Finds the index of the matching closing paren ) for an opening ( at openIndex.
 * Correctly tracks nested parens and string literals.
 *
 * @param {string} source
 * @param {number} openIndex
 * @returns {number} Index of matching ')', or -1 if unclosed
 */
export function findClosingParen(source, openIndex) {
    let depth = 0;
    let inStr = null;

    for (let i = openIndex; i < source.length; i++) {
        const ch = source[i];

        if (inStr && ch === "\\" && i + 1 < source.length) { i++; continue; }
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) inStr = null;
            else if (!inStr) inStr = ch;
            continue;
        }
        if (inStr) continue;

        if (ch === "(") { depth++; continue; }
        if (ch === ")") { depth--; if (depth === 0) return i; }
    }

    return -1;
}

/**
 * Finds the index of the matching closing brace } for an opening { at openIndex.
 * Correctly tracks nested braces, brackets, parens, and string literals.
 *
 * @param {string} source
 * @param {number} openIndex
 * @returns {number} Index of matching '}', or -1 if unclosed
 */
export function findClosingBrace(source, openIndex) {
    let depth = 0;
    let inStr = null;

    for (let i = openIndex; i < source.length; i++) {
        const ch = source[i];

        if (inStr && ch === "\\" && i + 1 < source.length) { i++; continue; }
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) inStr = null;
            else if (!inStr) inStr = ch;
            continue;
        }
        if (inStr) continue;

        if (ch === "{") { depth++; continue; }
        if (ch === "}") { depth--; if (depth === 0) return i; }
    }

    return -1;
}

/**
 * Finds the first { character between start and end indices.
 *
 * @param {string} source
 * @param {number} start
 * @param {number} end
 * @returns {number} Index of first '{', or -1 if not found
 */
export function findFirstBrace(source, start, end) {
    for (let i = start; i < end; i++) {
        if (source[i] === "{") return i;
    }
    return -1;
}

/**
 * Extracts the content inside the outermost braces of a { ... } string.
 *
 * @param {string} str
 * @returns {string|null} Inner content or null if invalid
 */
export function extractBraceContent(str) {
    const trimmed = (str || "").trim();
    if (!trimmed.startsWith("{")) return null;

    const closeIdx = findClosingBrace(trimmed, 0);
    if (closeIdx === -1) return null;

    return trimmed.slice(1, closeIdx);
}

/**
 * Extracts the first string literal argument from a raw arguments string.
 *
 * @example
 * extractFirstStringArg('"findOneAndDelete", async function ...') // returns "findOneAndDelete"
 */
export function extractFirstStringArg(argsRaw) {
    const match = /^[\s\n]*["'`]([^"'`]+)["'`]/.exec(argsRaw);
    return match ? match[1] : null;
}

/**
 * Extracts the first non-string identifier argument from a raw arguments string.
 *
 * @example
 * extractFirstIdentifierArg('passportLocalMongoose, { ... }') // returns "passportLocalMongoose"
 */
export function extractFirstIdentifierArg(argsRaw) {
    const match = /^[\s\n]*([\w.]+)/.exec(argsRaw);
    return match ? match[1] : null;
}

/**
 * Extracts the first argument from a raw arguments string as a raw substring.
 * Handles nested objects and arrays using depth tracking.
 *
 * @param {string} argsRaw
 * @returns {string}
 */
export function extractFirstArg(argsRaw) {
    let depth = 0;
    let inStr = null;

    for (let i = 0; i < argsRaw.length; i++) {
        const ch = argsRaw[i];

        if (inStr && ch === "\\" && i + 1 < argsRaw.length) { i++; continue; }
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) inStr = null;
            else if (!inStr)  inStr = ch;
            continue;
        }
        if (inStr) continue;

        if (ch === "(" || ch === "[" || ch === "{") { depth++; continue; }
        if (ch === ")" || ch === "]" || ch === "}") { depth--; continue; }

        if (ch === "," && depth === 0) {
            return argsRaw.slice(0, i).trim();
        }
    }

    return argsRaw.trim();
}

/**
 * Strips matching surrounding quotes ('', "", ``) from a string.
 *
 * @param {string} str
 * @returns {string}
 */
export function unquote(str) {
    const t = (str || "").trim();
    if (
        (t.startsWith('"') && t.endsWith('"')) ||
        (t.startsWith("'") && t.endsWith("'")) ||
        (t.startsWith("`") && t.endsWith("`"))
    ) {
        return t.slice(1, -1);
    }
    return t;
}

/**
 * Escapes characters with special meaning in Regular Expressions.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
    return (str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
