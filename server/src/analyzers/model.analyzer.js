/**
 * Model Analyzer V1
 *
 * WHY THIS EXISTS
 * ───────────────
 * Sending raw Mongoose model source to the LLM is wasteful and imprecise.
 * A 200-line model file contains boilerplate, imports, hooks, and comments
 * that consume tokens without adding signal. What the LLM actually needs
 * to write a "Database Models" section is:
 *
 *   - Model name and collection
 *   - Fields with their types and constraints
 *   - Indexes
 *   - Lifecycle hooks (pre/post middleware)
 *   - Plugins
 *
 * This analyzer extracts exactly that — producing a clean JSON structure
 * per model that the context builder can format efficiently.
 *
 * WHY THIS DESIGN (brace-depth scanner)
 * ──────────────────────────────────────
 * A Mongoose schema body is a nested object literal. Naive approaches —
 * line-by-line parsing, regex on field names, JSON.parse — all fail on
 * real schemas because:
 *
 *   title: { type: String, required: true },   ← nested object
 *   reviews: [{ type: ObjectId, ref: "User" }], ← array of objects
 *   geometry: {                                 ← multi-level nesting
 *       type: { type: String, enum: ["Point"] },
 *       coordinates: [Number]
 *   }
 *
 * The fix is the same character-level depth-tracking scanner used in
 * Route Analyzer V2. We scan the schema body keeping track of brace
 * and bracket depth so we can:
 *   1. Find the closing brace of the full schema definition.
 *   2. Extract top-level field entries (depth exactly 1).
 *   3. Parse each field's config object for type, required, ref, etc.
 *
 * SCALABILITY
 * ───────────
 * The pipeline is designed for extension:
 *   - Add Prisma support: implement a separate parsePrismaModel() and
 *     call it from analyzeModels() when a schema.prisma file is detected.
 *   - Add Sequelize: same pattern.
 *   - Add TypeScript: extend isModelFile() to recognise .ts extensions
 *     and add a TypeScript-aware comment stripper.
 *   - Add sub-schema recursion: the field parser already detects nested
 *     Schema() calls and marks them as "Mixed (sub-schema)" — recursion
 *     can be added later without changing the public interface.
 *
 * KNOWN LIMITATIONS (V1)
 * ──────────────────────
 * - Nested sub-schemas are typed as "Mixed" without field expansion.
 * - Spread syntax in schema objects ({ ...baseFields }) is skipped.
 * - Dynamic/computed field names ([someVariable]) are skipped.
 * - Multi-file schemas (fields defined across multiple files) are not
 *   merged — each file is parsed independently.
 * - TypeScript type decorators are not supported.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point called by repository.analyzer.js
 *
 * Accepts the full repository object and returns an array of model
 * descriptors, one per Mongoose model found across all model files.
 *
 * @param  {object} repository  The repository object from repository.reader.js
 * @returns {ModelDescriptor[]}
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
// File detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identifies files that likely contain Mongoose model definitions.
 *
 * Accepts:
 *   category === "models"         flat structure  (models/listing.js)
 *   category === "model"          alternative singular
 *   path contains /models/        nested          (src/models/listing.js)
 *   filename ends in .model.js    explicit naming (listing.model.js)
 *   path contains /schemas/       some projects use schemas/ instead
 */
function findModelFiles(repository) {

    return repository.files.filter((file) => {

        const cat = (file.category || "").toLowerCase();
        const p   = (file.path || "").replace(/\\/g, "/").toLowerCase();

        if (cat === "models" || cat === "model")  return true;
        if (p.includes("/models/"))               return true;
        if (p.includes("/schemas/"))              return true;
        if (/\.model\.[jt]s$/.test(p))           return true;

        return false;

    });

}

// ─────────────────────────────────────────────────────────────────────────────
// File-level parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses one model file and returns an array of model descriptors.
 * A single file can contain multiple models (uncommon but valid).
 *
 * Parse order matters:
 *   1. Strip comments — prevents matching schema definitions inside comments.
 *   2. Find all Schema variable bindings and inline model calls.
 *   3. For each schema, extract fields, indexes, hooks, plugins.
 *   4. Resolve the model name from mongoose.model() calls.
 */
function parseModelFile(file) {

    const models = [];

    try {

        const clean = stripComments(file.content);

        // Find all schema definitions in the file.
        // Each is a { varName, schemaBody } pair.
        const schemas = findSchemaDefinitions(clean);

        for (const schema of schemas) {

            const fields    = extractFields(schema.body);
            const indexes   = extractIndexes(clean, schema.varName);
            const hooks     = extractHooks(clean, schema.varName);
            const plugins   = extractPlugins(clean, schema.varName);
            const modelName = resolveModelName(clean, schema.varName);
            const collection = inferCollection(modelName);

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
// Schema definition finder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds every Schema definition in the source and returns its variable
 * name (for cross-referencing hooks and the model call) and its raw body.
 *
 * Recognises all three common patterns:
 *
 *   Pattern A:  const listingSchema = new Schema({ ... });
 *   Pattern B:  const listingSchema = new mongoose.Schema({ ... });
 *   Pattern C:  mongoose.model("Name", new Schema({ ... }))
 *               (inline, no variable binding)
 *
 * We use the brace-depth scanner (findClosingBrace) to correctly delimit
 * the schema body even when it contains nested objects.
 */
function findSchemaDefinitions(source) {

    const schemas = [];

    // Match:  new Schema(  OR  new mongoose.Schema(
    // Optionally preceded by  = (const foo =) to capture the variable name.
    // We look backwards from each match to find the variable name.
    const schemaRegex = /\bnew\s+(?:mongoose\s*\.\s*)?Schema\s*\(/g;

    let match;

    while ((match = schemaRegex.exec(source)) !== null) {

        // The opening paren is the last character of the match
        const openParenIdx = match.index + match[0].length - 1;

        // Find the matching close paren of Schema(...)
        const closeParenIdx = findClosingParen(source, openParenIdx);
        if (closeParenIdx === -1) continue;

        // The first argument to Schema() is the schema definition object.
        // Find the first { after the opening paren.
        const firstBrace = findFirstBrace(source, openParenIdx + 1, closeParenIdx);
        if (firstBrace === -1) continue;

        // Find the matching } for the schema body
        const closeBraceIdx = findClosingBrace(source, firstBrace);
        if (closeBraceIdx === -1) continue;

        const body = source.slice(firstBrace + 1, closeBraceIdx);

        // Try to resolve the variable name from the assignment before this match.
        // Look at the text before the "new Schema" call on the same logical statement.
        const before  = source.slice(0, match.index);
        const varName = extractSchemaVarName(before);

        schemas.push({ varName, body });

    }

    return schemas;

}

/**
 * Extracts the variable name from a  const foo =  or  var foo =  pattern
 * immediately before a Schema() call.
 *
 * We look at up to 100 characters before the "new Schema" keyword to find
 * the most recent  const|let|var identifier =  pattern.
 */
function extractSchemaVarName(before) {

    // Take a reasonably short window — variable declarations are close by
    const window = before.slice(-200);

    // Match:  const listingSchema =   or   let userSchema =
    const match = /(?:const|let|var)\s+(\w+)\s*=\s*$/.exec(window);

    return match ? match[1] : null;

}

// ─────────────────────────────────────────────────────────────────────────────
// Field extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the list of fields from the raw schema body string.
 *
 * The schema body is everything between the outer braces of  new Schema({ ... }).
 * We scan it at top-level depth (depth 0 relative to the body) to find
 * each  fieldName: ...  entry, then parse the value to determine type
 * and constraints.
 *
 * Handles:
 *   title: String                            (shorthand type)
 *   title: { type: String, required: true }  (config object)
 *   reviews: [{ type: ObjectId, ref: "X" }]  (array of ObjectId refs)
 *   reviews: [String]                         (array of primitives)
 *   geometry: { type: { ... }, coordinates: [...] }  (nested — typed Mixed)
 *
 * Skips:
 *   Spread entries  ...baseFields
 *   Computed keys   [someVar]: ...
 */
function extractFields(body) {

    const fields = [];

    // Extract all top-level key:value pairs from the schema body
    const entries = extractTopLevelEntries(body);

    for (const { key, value } of entries) {

        // Skip spread syntax and computed keys
        if (key.startsWith("...") || key.startsWith("[")) continue;

        const field = parseFieldValue(key, value.trim());

        if (field) {
            fields.push(field);
        }

    }

    return fields;

}

/**
 * Extracts top-level key:value pairs from an object body string.
 *
 * Uses the depth scanner to correctly handle nested objects and arrays.
 * Only yields entries at depth 0 (the immediate level of the schema body).
 *
 * Returns: Array of { key: string, value: string }
 */
function extractTopLevelEntries(body) {

    const entries = [];

    let i     = 0;
    let depth = 0;     // brace/bracket depth
    let inStr = null;  // current string delimiter or null

    let currentKey   = null;
    let valueStart   = -1;

    // State machine: KEY → COLON → VALUE → COMMA/EOF → repeat
    let state = "KEY";
    let keyBuf = "";

    while (i < body.length) {

        const ch   = body[i];
        const next = body[i + 1];

        // ── Escape sequences inside strings ──────────────────────────────────
        if (inStr && ch === "\\" && i + 1 < body.length) {
            if (state === "VALUE" && depth === 0) { /* value char */ }
            i += 2;
            continue;
        }

        // ── String boundaries ─────────────────────────────────────────────────
        if (ch === '"' || ch === "'" || ch === "`") {
            if (inStr === ch) {
                inStr = null;
            } else if (!inStr) {
                inStr = ch;
            }
            i++;
            continue;
        }

        if (inStr) { i++; continue; }

        // ── Depth tracking ────────────────────────────────────────────────────
        if (ch === "{" || ch === "[") {
            depth++;
            i++;
            continue;
        }

        if (ch === "}" || ch === "]") {
            depth--;
            i++;
            continue;
        }

        // ── Key scanning (depth 0 only) ───────────────────────────────────────
        if (state === "KEY" && depth === 0) {

            if (ch === ":") {
                currentKey = keyBuf.trim();
                keyBuf     = "";
                valueStart = i + 1;
                state      = "VALUE";
                i++;
                continue;
            }

            if (ch === ",") {
                // bare comma with no colon — skip (e.g. trailing comma)
                keyBuf = "";
                i++;
                continue;
            }

            keyBuf += ch;
            i++;
            continue;

        }

        // ── Value scanning ────────────────────────────────────────────────────
        if (state === "VALUE") {

            // A top-level comma ends the current entry
            if (ch === "," && depth === 0) {

                if (currentKey) {
                    entries.push({
                        key:   currentKey,
                        value: body.slice(valueStart, i).trim(),
                    });
                }

                currentKey = null;
                valueStart = -1;
                state      = "KEY";
                keyBuf     = "";
                i++;
                continue;

            }

            i++;
            continue;

        }

        i++;

    }

    // Flush the last entry (no trailing comma)
    if (state === "VALUE" && currentKey && valueStart !== -1) {
        entries.push({
            key:   currentKey,
            value: body.slice(valueStart).trim(),
        });
    }

    return entries;

}

/**
 * Parses a single field's value expression into a FieldDescriptor.
 *
 * Recognises these value shapes:
 *   String                 → { type: "String" }
 *   [String]               → { type: "Array<String>" }
 *   [{ type: ObjectId }]   → { type: "Array<ObjectId>", ref: "..." }
 *   { type: String, ... }  → full config object
 *   new Schema({ ... })    → { type: "Mixed (sub-schema)" }
 */
function parseFieldValue(name, value) {

    // Guard: skip empty
    if (!value) return null;

    // ── Sub-schema: new Schema({ ... }) ──────────────────────────────────────
    if (/\bnew\s+(?:mongoose\s*\.\s*)?Schema\s*\(/.test(value)) {
        return { name, type: "Mixed (sub-schema)" };
    }

    // ── Array shorthand: [String] or [Number] ────────────────────────────────
    const primitiveArray = /^\[\s*(\w+)\s*\]$/.exec(value);
    if (primitiveArray) {
        return { name, type: `Array<${primitiveArray[1]}>` };
    }

    // ── Array of config objects: [{ type: ..., ref: ... }] ───────────────────
    // Handle all formatting variants:
    //   [{type: ObjectId}]           — compact
    //   [ { type: ObjectId } ]       — spaced
    //   [\n  {\n    type: ObjectId   — multi-line (Mongoose style)
    if (value.startsWith("[")) {
        const innerBraceIdx = value.indexOf("{");
        if (innerBraceIdx !== -1) {
            // Verify no non-whitespace characters between [ and {
            // (to avoid matching [String, {options}] type patterns)
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

    // ── Config object: { type: ..., required: true, ... } ────────────────────
    if (value.startsWith("{")) {
        const inner = extractBraceContent(value);
        if (inner !== null) {
            const config = parseConfigObject(inner);
            return buildFieldFromConfig(name, config);
        }
        return { name, type: "Mixed" };
    }

    // ── Shorthand primitive: just a type constructor name ────────────────────
    // e.g.  title: String   or   count: Number
    const shorthand = /^(String|Number|Boolean|Date|Buffer|Mixed|ObjectId|Decimal128|Map|BigInt)$/.exec(value.trim());
    if (shorthand) {
        return { name, type: shorthand[1] };
    }

    // ── Schema.Types.ObjectId shorthand ──────────────────────────────────────
    if (/Schema\.Types\.ObjectId/.test(value) || /mongoose\.Schema\.Types\.ObjectId/.test(value)) {
        return { name, type: "ObjectId" };
    }

    // Fallback: unrecognised shorthand — record as Unknown
    return { name, type: "Unknown" };

}

/**
 * Builds a FieldDescriptor from a parsed config object.
 *
 * Config properties supported:
 *   type, required, unique, default, enum, min, max, ref, trim, lowercase
 */
function buildFieldFromConfig(name, config) {

    const rawType = config.type || "Mixed";
    const type    = normaliseType(rawType);

    const field = { name, type };

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
        // enum value is the raw array string, e.g.  ["Forest", "Mountain"]
        // Try to parse it into a real array for cleaner output
        field.enum = parseEnumValues(config.enum);
    }

    if (config.min !== undefined) field.min = config.min;
    if (config.max !== undefined) field.max = config.max;

    if (config.ref) {
        field.ref = unquote(config.ref);
    }

    return field;

}

/**
 * Parses a raw config object body (everything inside the outer braces)
 * into a flat key→value map.
 *
 * This is a simplified parser — it extracts only flat  key: value  pairs
 * at depth 0. Nested sub-objects (like the type field in geometry schemas)
 * are captured as raw strings.
 */
function parseConfigObject(body) {

    const config = {};
    const entries = extractTopLevelEntries(body);

    for (const { key, value } of entries) {
        const cleanKey = key.trim().replace(/^["'`]|["'`]$/g, "");
        config[cleanKey] = value.trim();
    }

    return config;

}

// ─────────────────────────────────────────────────────────────────────────────
// Type normaliser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises a raw type token from a schema definition into a clean
 * display string.
 *
 * Handles:
 *   Schema.Types.ObjectId      → "ObjectId"
 *   mongoose.Schema.Types.Map  → "Map"
 *   String                     → "String"
 *   nested { type: String }    → "Mixed (nested)" (the value is an object)
 */
function normaliseType(raw) {

    if (!raw) return "Mixed";

    const t = raw.trim();

    // Nested object as type → sub-schema / mixed
    if (t.startsWith("{")) return "Mixed (nested)";

    // Schema.Types.X or mongoose.Schema.Types.X
    const schemaTypes = /(?:mongoose\.)?(?:Schema\.Types\.|Types\.)(\w+)/.exec(t);
    if (schemaTypes) return schemaTypes[1];

    // Already a plain name
    return t;

}

// ─────────────────────────────────────────────────────────────────────────────
// Enum parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempts to parse the raw enum value string into a JS array of strings.
 * Falls back to returning the raw string if parsing fails.
 *
 * Input:  ["Forest", "Mountain", "Beach"]
 * Output: ["Forest", "Mountain", "Beach"]
 */
function parseEnumValues(raw) {

    try {

        // Replace single quotes with double quotes for JSON compatibility
        const jsonSafe = raw
            .replace(/'/g, '"')
            .replace(/`/g, '"')
            // Remove trailing commas before ]
            .replace(/,\s*\]/g, "]");

        return JSON.parse(jsonSafe);

    } catch {

        // Return raw string if parsing fails
        return raw;

    }

}

// ─────────────────────────────────────────────────────────────────────────────
// Index extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts schema.index() calls tied to the given schema variable.
 *
 * Recognises:
 *   listingSchema.index({ geometry: "2dsphere" })
 *   listingSchema.index({ field: 1 }, { unique: true })
 *
 * Returns an array of index descriptor strings like:
 *   "2dsphere"
 *   "{ field: 1 } (unique)"
 */
function extractIndexes(source, varName) {

    if (!varName) return [];

    const indexes = [];

    // Match:  varName.index(
    const indexRegex = new RegExp(
        `\\b${escapeRegex(varName)}\\s*\\.\\s*index\\s*\\(`,
        "g"
    );

    let match;

    while ((match = indexRegex.exec(source)) !== null) {

        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);

        if (closeIdx === -1) continue;

        const argsRaw = source.slice(openIdx + 1, closeIdx).trim();

        // Extract the first argument (the index fields spec)
        const firstArg = extractFirstArg(argsRaw);

        // Check for options argument (second arg) for { unique: true }
        const hasUnique = /\bunique\s*:\s*true\b/.test(argsRaw);

        // Extract the index type values from the first arg object
        // e.g. { geometry: "2dsphere" } → "2dsphere"
        const typeMatch = /["'`]([^"'`]+)["'`]/.exec(firstArg);
        const numMatch  = /:\s*(-?\d+)/.exec(firstArg);

        let descriptor;

        if (typeMatch) {
            descriptor = typeMatch[1];
        } else if (numMatch) {
            descriptor = firstArg.trim();
        } else {
            descriptor = firstArg.trim();
        }

        if (hasUnique) {
            descriptor += " (unique)";
        }

        if (descriptor) {
            indexes.push(descriptor);
        }

    }

    return indexes;

}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts schema.pre() and schema.post() middleware hooks.
 *
 * Recognises:
 *   listingSchema.post("findOneAndDelete", async function (listing) { ... })
 *   userSchema.pre("save", async function() { ... })
 *
 * Returns an array of strings like:
 *   "post(findOneAndDelete)"
 *   "pre(save)"
 */
function extractHooks(source, varName) {

    if (!varName) return [];

    const hooks = [];

    // Match:  varName.pre(  or  varName.post(
    const hookRegex = new RegExp(
        `\\b${escapeRegex(varName)}\\s*\\.\\s*(pre|post)\\s*\\(`,
        "g"
    );

    let match;

    while ((match = hookRegex.exec(source)) !== null) {

        const hookType = match[1]; // "pre" or "post"
        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);

        if (closeIdx === -1) continue;

        const argsRaw  = source.slice(openIdx + 1, closeIdx);
        const hookName = extractFirstStringArg(argsRaw);

        if (hookName) {
            hooks.push(`${hookType}(${hookName})`);
        }

    }

    return hooks;

}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts schema.plugin() calls.
 *
 * Recognises:
 *   userSchema.plugin(passportLocalMongoose)
 *   userSchema.plugin(mongoosePaginate, { limit: 20 })
 *
 * Returns an array of plugin name strings:
 *   ["passportLocalMongoose", "mongoosePaginate"]
 */
function extractPlugins(source, varName) {

    if (!varName) return [];

    const plugins = [];

    const pluginRegex = new RegExp(
        `\\b${escapeRegex(varName)}\\s*\\.\\s*plugin\\s*\\(`,
        "g"
    );

    let match;

    while ((match = pluginRegex.exec(source)) !== null) {

        const openIdx  = match.index + match[0].length - 1;
        const closeIdx = findClosingParen(source, openIdx);

        if (closeIdx === -1) continue;

        const argsRaw  = source.slice(openIdx + 1, closeIdx).trim();

        // The first argument is the plugin identifier (not a string, it's a variable)
        // Split on the first comma that is at depth 0 to get only the plugin name
        const pluginName = extractFirstIdentifierArg(argsRaw);

        if (pluginName) {
            plugins.push(pluginName);
        }

    }

    return plugins;

}

// ─────────────────────────────────────────────────────────────────────────────
// Model name resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves the human-readable model name from a mongoose.model() call.
 *
 * Searches for patterns like:
 *   mongoose.model("Listing", listingSchema)
 *   mongoose.model("User", userSchema)
 *
 * If varName is provided, it tries to match the specific schema variable.
 * Falls back to the first mongoose.model() call found.
 */
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

        // If we have a varName, verify this model call references our schema
        if (varName) {
            if (argsRaw.includes(varName)) {
                return name;
            }
            // Continue looking for the right one
            continue;
        }

        return name;

    }

    return null;

}

// ─────────────────────────────────────────────────────────────────────────────
// Collection name inference
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infers the MongoDB collection name from the model name.
 * Mongoose pluralises and lowercases by default.
 *
 * Handles common English irregular plurals. For any name not in the
 * irregular list, appends "s" (which is correct for the vast majority).
 *
 * Note: Mongoose uses a library (pluralize) for this. We intentionally
 * do NOT pull in that dependency — this covers 95% of real-world cases.
 */
function inferCollection(modelName) {

    if (!modelName) return null;

    const lower = modelName.toLowerCase();

    const irregulars = {
        person:  "people",
        man:     "men",
        woman:   "women",
        child:   "children",
        tooth:   "teeth",
        foot:    "feet",
        mouse:   "mice",
        goose:   "geese",
        ox:      "oxen",
        leaf:    "leaves",
        knife:   "knives",
        life:    "lives",
        wife:    "wives",
        half:    "halves",
        shelf:   "shelves",
        wolf:    "wolves",
        self:    "selves",
        elf:     "elves",
        leaf:    "leaves",
        loaf:    "loaves",
        potato:  "potatoes",
        tomato:  "tomatoes",
        cactus:  "cacti",
        focus:   "foci",
        fungus:  "fungi",
        nucleus: "nuclei",
        syllabus: "syllabi",
        analysis: "analyses",
        diagnosis: "diagnoses",
        oasis:   "oases",
        thesis:  "theses",
        crisis:  "crises",
        basis:   "bases",
        datum:   "data",
        medium:  "media",
        curriculum: "curricula",
        quiz:    "quizzes",
    };

    if (irregulars[lower]) return irregulars[lower];

    // Words ending in s, x, z, ch, sh → add "es"
    if (/(?:s|x|z|ch|sh)$/.test(lower)) return lower + "es";

    // Words ending in consonant + y → change y to ies
    if (/[^aeiou]y$/.test(lower)) return lower.slice(0, -1) + "ies";

    // Default: add "s"
    return lower + "s";

}

// ─────────────────────────────────────────────────────────────────────────────
// Comment stripping  (same logic as route.analyzer.js — kept local to avoid
// coupling between analyzers)
// ─────────────────────────────────────────────────────────────────────────────

function stripComments(source) {

    let result = "";
    let i      = 0;
    let inStr  = null;

    while (i < source.length) {

        const ch   = source[i];
        const next = source[i + 1];

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

        if (ch === '"' || ch === "'" || ch === "`") {
            inStr = ch;
            result += ch;
            i++;
            continue;
        }

        if (ch === "/" && next === "/") {
            while (i < source.length && source[i] !== "\n") i++;
            continue;
        }

        if (ch === "/" && next === "*") {
            i += 2;
            while (i + 1 < source.length) {
                if (source[i] === "*" && source[i + 1] === "/") { i += 2; break; }
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
// Depth-tracking scanner utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds the index of the matching closing paren ) for an opening ( at openIndex.
 * Correctly handles nested parens and string literals.
 * Returns -1 if not found.
 */
function findClosingParen(source, openIndex) {

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
 * Correctly handles nested braces, brackets, parens, and string literals.
 * Returns -1 if not found.
 */
function findClosingBrace(source, openIndex) {

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
 * Returns -1 if not found.
 */
function findFirstBrace(source, start, end) {

    for (let i = start; i < end; i++) {
        if (source[i] === "{") return i;
    }

    return -1;

}

/**
 * Extracts the content inside the outermost braces of a { ... } string.
 * Returns null if the input doesn't start with {.
 */
function extractBraceContent(str) {

    const trimmed = str.trim();
    if (!trimmed.startsWith("{")) return null;

    const closeIdx = findClosingBrace(trimmed, 0);
    if (closeIdx === -1) return null;

    return trimmed.slice(1, closeIdx);

}

// ─────────────────────────────────────────────────────────────────────────────
// Argument extraction helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the first string literal argument from a raw arguments string.
 *
 * Input:  "findOneAndDelete", async function ...
 * Output: "findOneAndDelete"
 */
function extractFirstStringArg(argsRaw) {

    const match = /^[\s\n]*["'`]([^"'`]+)["'`]/.exec(argsRaw);
    return match ? match[1] : null;

}

/**
 * Extracts the first non-string identifier argument from a raw arguments string.
 *
 * Input:  passportLocalMongoose, { ... }
 * Output: "passportLocalMongoose"
 *
 * Input:  mongoosePaginate
 * Output: "mongoosePaginate"
 */
function extractFirstIdentifierArg(argsRaw) {

    const match = /^[\s\n]*([\w.]+)/.exec(argsRaw);
    return match ? match[1] : null;

}

/**
 * Extracts the first argument from a raw arguments string as a raw substring.
 * Handles nested objects/arrays using depth tracking.
 */
function extractFirstArg(argsRaw) {

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

// ─────────────────────────────────────────────────────────────────────────────
// String utilities
// ─────────────────────────────────────────────────────────────────────────────

function unquote(str) {
    const t = (str || "").trim();
    if (
        (t.startsWith('"')  && t.endsWith('"'))  ||
        (t.startsWith("'")  && t.endsWith("'"))  ||
        (t.startsWith("`")  && t.endsWith("`"))
    ) {
        return t.slice(1, -1);
    }
    return t;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
