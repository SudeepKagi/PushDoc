/**
 * Model Analyzer — model.analyzer.js
 *
 * Extracts structured Mongoose model descriptors from JavaScript/TypeScript model files.
 *
 * EXTRACTED INFORMATION
 * ─────────────────────
 * • Model name and inferred collection
 * • Fields with data types, constraints (required, unique, default, enum, min, max), and references
 * • Schema indexes (compound, 2dsphere, unique)
 * • Lifecycle middleware hooks (pre/post save, find, etc.)
 * • Mongoose plugins (passportLocalMongoose, paginate, etc.)
 */

import {
    stripComments,
    findClosingParen,
    findClosingBrace,
    findFirstBrace,
    extractBraceContent,
    extractFirstStringArg,
    extractFirstIdentifierArg,
    extractFirstArg,
    unquote,
    escapeRegex,
} from "./utils/scanner.utils.js";

import { inferCollectionName } from "./utils/pluralizer.utils.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point called by repository.analyzer.js
 *
 * @param  {object} repository  The repository object from repository.reader.js
 * @returns {Array<object>} Model descriptors
 */
export const analyzeModels = (repository) => {
    const modelFiles = findModelFiles(repository);
    const models = [];

    for (const file of modelFiles) {
        const fileModels = parseModelFile(file);
        models.push(...fileModels);
    }

    return models;
};

// ─────────────────────────────────────────────────────────────────────────────
// File Detection & Parsing
// ─────────────────────────────────────────────────────────────────────────────

function findModelFiles(repository) {
    return (repository?.files || []).filter((file) => {
        const cat = (file.category || "").toLowerCase();
        const p   = (file.path || "").replace(/\\/g, "/").toLowerCase();

        if (cat === "models" || cat === "model")  return true;
        if (p.includes("/models/"))               return true;
        if (p.includes("/schemas/"))              return true;
        if (/\.model\.[jt]s$/.test(p))           return true;

        return false;
    });
}

function parseModelFile(file) {
    const models = [];

    try {
        const clean = stripComments(file.content);
        const schemas = findSchemaDefinitions(clean);

        for (const schema of schemas) {
            const fields     = extractFields(schema.body);
            const indexes    = extractIndexes(clean, schema.varName);
            const hooks      = extractHooks(clean, schema.varName);
            const plugins    = extractPlugins(clean, schema.varName);
            const modelName  = resolveModelName(clean, schema.varName);
            const collection = inferCollectionName(modelName);

            models.push({
                name:       modelName || schema.varName || "Unknown",
                collection,
                fields,
                indexes,
                middleware: hooks,
                plugins,
                file:       file.path,
            });
        }
    } catch {
        // Ignore malformed files — do not crash the pipeline
    }

    return models;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Definition Finder
// ─────────────────────────────────────────────────────────────────────────────

function findSchemaDefinitions(source) {
    const schemas = [];
    const schemaRegex = /\bnew\s+(?:mongoose\s*\.\s*)?Schema\s*\(/g;
    let match;

    while ((match = schemaRegex.exec(source)) !== null) {
        const openParenIdx = match.index + match[0].length - 1;
        const closeParenIdx = findClosingParen(source, openParenIdx);
        if (closeParenIdx === -1) continue;

        const firstBrace = findFirstBrace(source, openParenIdx + 1, closeParenIdx);
        if (firstBrace === -1) continue;

        const closeBraceIdx = findClosingBrace(source, firstBrace);
        if (closeBraceIdx === -1) continue;

        const body = source.slice(firstBrace + 1, closeBraceIdx);
        const before = source.slice(0, match.index);
        const varName = extractSchemaVarName(before);

        schemas.push({ varName, body });
    }

    return schemas;
}

function extractSchemaVarName(before) {
    const window = before.slice(-200);
    const match = /(?:const|let|var)\s+(\w+)\s*=\s*$/.exec(window);
    return match ? match[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Extractor & Type Parser
// ─────────────────────────────────────────────────────────────────────────────

function extractFields(body) {
    const fields = [];
    const entries = extractTopLevelEntries(body);

    for (const { key, value } of entries) {
        if (key.startsWith("...") || key.startsWith("[")) continue;
        const field = parseFieldValue(key, value.trim());
        if (field) {
            fields.push(field);
        }
    }

    return fields;
}

function extractTopLevelEntries(body) {
    const entries = [];
    let i = 0;
    let depth = 0;
    let inStr = null;

    let currentKey = null;
    let valueStart = -1;
    let state = "KEY";
    let keyBuf = "";

    while (i < body.length) {
        const ch = body[i];

        if (inStr && ch === "\\" && i + 1 < body.length) {
            i += 2;
            continue;
        }

        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) inStr = null;
            else if (!inStr) inStr = ch;
            i++;
            continue;
        }

        if (inStr) { i++; continue; }

        if (ch === "{" || ch === "[") { depth++; i++; continue; }
        if (ch === "}" || ch === "]") { depth--; i++; continue; }

        if (state === "KEY" && depth === 0) {
            if (ch === ":") {
                currentKey = keyBuf.trim();
                keyBuf = "";
                valueStart = i + 1;
                state = "VALUE";
                i++;
                continue;
            }
            if (ch === ",") {
                keyBuf = "";
                i++;
                continue;
            }
            keyBuf += ch;
            i++;
            continue;
        }

        if (state === "VALUE") {
            if (ch === "," && depth === 0) {
                if (currentKey) {
                    entries.push({
                        key:   currentKey,
                        value: body.slice(valueStart, i).trim(),
                    });
                }
                currentKey = null;
                valueStart = -1;
                state = "KEY";
                keyBuf = "";
                i++;
                continue;
            }
            i++;
            continue;
        }

        i++;
    }

    if (state === "VALUE" && currentKey && valueStart !== -1) {
        entries.push({
            key:   currentKey,
            value: body.slice(valueStart).trim(),
        });
    }

    return entries;
}

function parseFieldValue(name, value) {
    if (!value) return null;

    // Sub-schema: new Schema({ ... })
    if (/\bnew\s+(?:mongoose\s*\.\s*)?Schema\s*\(/.test(value)) {
        return { name, type: "Mixed (sub-schema)" };
    }

    // Array shorthand: [String] or [Number]
    const primitiveArray = /^\[\s*(\w+)\s*\]$/.exec(value);
    if (primitiveArray) {
        return { name, type: `Array<${primitiveArray[1]}>` };
    }

    // Array of config objects: [{ type: ..., ref: ... }]
    if (value.startsWith("[")) {
        const innerBraceIdx = value.indexOf("{");
        if (innerBraceIdx !== -1) {
            const between = value.slice(1, innerBraceIdx);
            if (/^\s*$/.test(between)) {
                const inner = extractBraceContent(value.slice(innerBraceIdx));
                if (inner !== null) {
                    const config = parseConfigObject(inner);
                    const type   = normaliseType(config.type || "ObjectId");
                    const field  = { name, type: `Array<${type}>` };
                    if (config.ref) field.ref = unquote(config.ref);
                    return field;
                }
                return { name, type: "Array<Mixed>" };
            }
        }
    }

    // Config object: { type: ..., required: true, ... }
    if (value.startsWith("{")) {
        const inner = extractBraceContent(value);
        if (inner !== null) {
            const config = parseConfigObject(inner);
            return buildFieldFromConfig(name, config);
        }
        return { name, type: "Mixed" };
    }

    // Shorthand primitive
    const shorthand = /^(String|Number|Boolean|Date|Buffer|Mixed|ObjectId|Decimal128|Map|BigInt)$/.exec(value.trim());
    if (shorthand) {
        return { name, type: shorthand[1] };
    }

    // Schema.Types.ObjectId shorthand
    if (/Schema\.Types\.ObjectId/.test(value) || /mongoose\.Schema\.Types\.ObjectId/.test(value)) {
        return { name, type: "ObjectId" };
    }

    return { name, type: "Unknown" };
}

function buildFieldFromConfig(name, config) {
    const rawType = config.type || "Mixed";
    const type    = normaliseType(rawType);
    const field   = { name, type };

    if (config.required === "true" || config.required === true) {
        field.required = true;
    }
    if (config.unique === "true" || config.unique === true) {
        field.unique = true;
    }
    if (config.default !== undefined && config.default !== null && config.default !== "") {
        field.default = config.default;
    }
    if (config.enum) {
        field.enum = parseEnumValues(config.enum);
    }
    if (config.min !== undefined) field.min = config.min;
    if (config.max !== undefined) field.max = config.max;
    if (config.ref) {
        field.ref = unquote(config.ref);
    }

    return field;
}

function parseConfigObject(body) {
    const config = {};
    const entries = extractTopLevelEntries(body);

    for (const { key, value } of entries) {
        const cleanKey = key.trim().replace(/^["'`]|["'`]$/g, "");
        config[cleanKey] = value.trim();
    }

    return config;
}

function normaliseType(raw) {
    if (!raw) return "Mixed";
    const t = raw.trim();
    if (t.startsWith("{")) return "Mixed (nested)";

    const schemaTypes = /(?:mongoose\.)?(?:Schema\.Types\.|Types\.)(\w+)/.exec(t);
    if (schemaTypes) return schemaTypes[1];

    return t;
}

function parseEnumValues(raw) {
    try {
        const jsonSafe = raw
            .replace(/'/g, '"')
            .replace(/`/g, '"')
            .replace(/,\s*\]/g, "]");
        return JSON.parse(jsonSafe);
    } catch {
        return raw;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Indexes, Hooks & Plugins Extractors
// ─────────────────────────────────────────────────────────────────────────────

function extractIndexes(source, varName) {
    if (!varName) return [];
    const indexes = [];
    const indexRegex = new RegExp(`\\b${escapeRegex(varName)}\\s*\\.\\s*index\\s*\\(`, "g");
    let match;

    while ((match = indexRegex.exec(source)) !== null) {
        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);
        if (closeIdx === -1) continue;

        const argsRaw   = source.slice(openIdx + 1, closeIdx).trim();
        const firstArg  = extractFirstArg(argsRaw);
        const hasUnique = /\bunique\s*:\s*true\b/.test(argsRaw);

        const typeMatch = /["'`]([^"'`]+)["'`]/.exec(firstArg);
        const numMatch  = /:\s*(-?\d+)/.exec(firstArg);

        let descriptor = typeMatch ? typeMatch[1] : numMatch ? firstArg.trim() : firstArg.trim();
        if (hasUnique) descriptor += " (unique)";

        if (descriptor) indexes.push(descriptor);
    }

    return indexes;
}

function extractHooks(source, varName) {
    if (!varName) return [];
    const hooks = [];
    const hookRegex = new RegExp(`\\b${escapeRegex(varName)}\\s*\\.\\s*(pre|post)\\s*\\(`, "g");
    let match;

    while ((match = hookRegex.exec(source)) !== null) {
        const hookType = match[1];
        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);
        if (closeIdx === -1) continue;

        const argsRaw  = source.slice(openIdx + 1, closeIdx);
        const hookName = extractFirstStringArg(argsRaw);
        if (hookName) hooks.push(`${hookType}(${hookName})`);
    }

    return hooks;
}

function extractPlugins(source, varName) {
    if (!varName) return [];
    const plugins = [];
    const pluginRegex = new RegExp(`\\b${escapeRegex(varName)}\\s*\\.\\s*plugin\\s*\\(`, "g");
    let match;

    while ((match = pluginRegex.exec(source)) !== null) {
        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);
        if (closeIdx === -1) continue;

        const argsRaw    = source.slice(openIdx + 1, closeIdx).trim();
        const pluginName = extractFirstIdentifierArg(argsRaw);
        if (pluginName) plugins.push(pluginName);
    }

    return plugins;
}

function resolveModelName(source, varName) {
    const modelRegex = /\bmongoose\s*\.\s*model\s*\(/g;
    let match;

    while ((match = modelRegex.exec(source)) !== null) {
        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);
        if (closeIdx === -1) continue;

        const argsRaw = source.slice(openIdx + 1, closeIdx);
        const name    = extractFirstStringArg(argsRaw);
        if (!name) continue;

        if (varName) {
            if (argsRaw.includes(varName)) return name;
            continue;
        }

        return name;
    }

    return null;
}
