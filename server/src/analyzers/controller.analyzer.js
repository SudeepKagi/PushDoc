/**
 * Controller Analyzer V1
 *
 * WHY THIS EXISTS
 * ───────────────
 * The LLM needs to document the actual business logic and side effects
 * of each controller endpoint (e.g. geocoding, payment processing, image uploads,
 * database operations). Without this analyzer, the prompt builder would have to
 * pass full controller source code, consuming massive amounts of tokens.
 *
 * This analyzer extracts the business actions, database models, methods used,
 * and external integrations of each exported controller function, returning
 * a clean metadata block.
 *
 * WHY THIS DESIGN
 * ───────────────
 * Like previous analyzers, we use a lightweight, regex-anchored delimiter
 * scanner. We scan the controller file for exported function patterns and then
 * trace parenthetical/brace depth to extract the exact function body.
 *
 * Within the body, we identify:
 *   1. Mongoose model declarations and calls (e.g., Listing.find()).
 *   2. Third-party integrations (Cloudinary, Mapbox, Stripe, Redis, etc.).
 *   3. Business operations mapped from methods and integrations.
 *
 * FUTURE SCALABILITY
 * ──────────────────
 * - Adapt to NestJS / Fastify: Since NestJS uses TS decorators (e.g. `@Get()`),
 *   we can expand the regex rules to capture decorator boundaries and map them
 *   without changing the public interface.
 * - Model abstractions: The Mongoose model list can be expanded to Sequelize
 *   or Prisma queries without touching the outer controller logic.
 *
 * LIMITATIONS
 * ───────────
 * - Dynamic requires/imports of controllers (e.g., dynamically loading files)
 *   are not supported.
 * - Dynamic method names (e.g. calling listing[method]()) are skipped.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants and Mappings
// ─────────────────────────────────────────────────────────────────────────────

const MONGOOSE_METHODS = [
    "find",
    "findById",
    "findOne",
    "save",
    "create",
    "updateOne",
    "updateMany",
    "findByIdAndUpdate",
    "deleteOne",
    "deleteMany",
    "findByIdAndDelete",
    "aggregate",
    "populate",
    "countDocuments",
];

// Map Mongoose methods to business capabilities
const METHOD_CAPABILITY_MAP = {
    find:              ["Find Listings", "Filter Listings"],
    findById:          ["Find Listings"],
    findOne:           ["Find Listings"],
    save:              ["Create Listing"],
    create:            ["Create Listing"],
    updateOne:         ["Update Listing"],
    updateMany:        ["Update Listing"],
    findByIdAndUpdate: ["Update Listing"],
    deleteOne:         ["Delete Listing"],
    deleteMany:        ["Delete Listing"],
    findByIdAndDelete: ["Delete Listing"],
    aggregate:         ["Aggregate Listings"],
    countDocuments:    ["Count Listings"],
    populate:          ["Populate Listings"],
};

// Map integrations to business capabilities
const INTEGRATION_MAP = [
    { pattern: /\b\w*cloudinary\w*\b/i,          op: "Upload Image",            name: "Cloudinary" },
    { pattern: /\b\w*(mapbox|geocoding)\w*\b/i,   op: "Geocode Location",        name: "Mapbox" },
    { pattern: /\b\w*stripe\w*\b/i,              op: "Process Payment",         name: "Stripe" },
    { pattern: /\b\w*razorpay\w*\b/i,            op: "Process Payment",         name: "Razorpay" },
    { pattern: /\b\w*redis(Client)?\w*\b/i,      op: "Cache Data",              name: "Redis" },
    { pattern: /\b\w*(Queue|Worker|bullmq)\w*\b/i, op: "Background Jobs",       name: "BullMQ" },
    { pattern: /\b\w*jwt\w*\b/i,                 op: "Generate Token",          name: "JWT" },
    { pattern: /\b\w*passport\w*\b/i,            op: "Authenticate User",       name: "Passport" },
    { pattern: /\b\w*(nodemailer|sendMail|mail)\w*\b/i, op: "Send Email",        name: "Nodemailer" },
    { pattern: /\b\w*firebase\w*\b/i,            op: "Firebase Integration",    name: "Firebase" },
    { pattern: /\b\w*groq\w*\b/i,                op: "AI Generation",           name: "Groq" },
    { pattern: /\b\w*gemini\w*\b/i,              op: "AI Generation",           name: "Gemini" },
    { pattern: /\b\w*openai\w*\b/i,              op: "AI Generation",           name: "OpenAI" },
    { pattern: /\b\w*(axios|fetch)\w*\b/i,       op: "External API Call",       name: "Axios/Fetch" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point called by repository.analyzer.js
 */
export const analyzeControllers = (repository) => {
    const controllerFiles = findControllerFiles(repository);
    const controllers = [];

    for (const file of controllerFiles) {
        const parsed = parseControllerFile(file);
        if (parsed) {
            controllers.push(parsed);
        }
    }

    return controllers;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: File Finder
// ─────────────────────────────────────────────────────────────────────────────

function findControllerFiles(repository) {
    return repository.files.filter((file) => {
        const cat = (file.category || "").toLowerCase();
        const p   = (file.path || "").replace(/\\/g, "/").toLowerCase();

        if (cat === "controllers" || cat === "controller") return true;
        if (p.includes("/controllers/")) return true;
        if (p.includes("/controller/")) return true;
        if (/\.controller\.[jt]s$/.test(p)) return true;
        if (/controller\.[jt]s$/.test(p)) return true;

        return false;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: File Parser
// ─────────────────────────────────────────────────────────────────────────────

function parseControllerFile(file) {
    const clean = stripComments(file.content);
    const functions = extractFunctions(clean);

    if (functions.length === 0) return null;

    const exportsList = [];

    for (const fn of functions) {
        if (fn.isExported) {
            const analysis = analyzeFunctionBody(fn.body);
            exportsList.push({
                name: fn.name,
                operations: analysis.operations,
                models: analysis.models,
                methods: analysis.methods,
            });
        }
    }

    return {
        controller: file.path,
        exports: exportsList,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Function Extractor
// ─────────────────────────────────────────────────────────────────────────────

function extractFunctions(source) {
    const functions = [];

    // Pattern 1: Named function declaration
    // Matches: function name(...) { OR async function name(...) { OR export async function name(...) {
    const namedFnRegex = /\b(export\s+(?:default\s+)?)?(async\s+)?function\s+(\w+)\s*\(/g;
    let match;

    while ((match = namedFnRegex.exec(source)) !== null) {
        const isExport = !!match[1];
        const name = match[3];
        const openParenIdx = match.index + match[0].length - 1;
        const closeParenIdx = findClosingParen(source, openParenIdx);
        if (closeParenIdx === -1) continue;

        const firstBrace = source.indexOf("{", closeParenIdx);
        if (firstBrace === -1) continue;

        const closeBrace = findClosingBrace(source, firstBrace);
        if (closeBrace === -1) continue;

        const body = source.slice(firstBrace + 1, closeBrace);
        functions.push({
            name,
            body,
            isExported: isExport,
            startIdx: match.index,
            endIdx: closeBrace,
        });
    }

    // Pattern 2A: Arrow/Anonymous variable assignment (const/let/var with space)
    // Matches: const name = async(...) => { OR const name = function(...) {
    // Groups: 1=export, 2=name, 3=async, 4==>{ or function(
    const varAssignFnRegex = /\b(export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(async\s+)?\s*(?:\([^)]*\)|[\w$]+)?\s*(=>\s*\{|function\s*\()/g;

    while ((match = varAssignFnRegex.exec(source)) !== null) {
        const exportPrefix = match[1];
        const name = match[2];
        const functionType = match[4];

        const isExport = !!exportPrefix;

        let bodyStart = -1;
        if (functionType && functionType.startsWith("=>")) {
            bodyStart = match.index + match[0].length - 1; // position of {
        } else {
            const openParenIdx = source.indexOf("(", match.index + match[0].length - 30);
            const closeParenIdx = findClosingParen(source, openParenIdx);
            if (closeParenIdx === -1) continue;
            bodyStart = source.indexOf("{", closeParenIdx);
        }

        if (bodyStart === -1) continue;

        const closeBrace = findClosingBrace(source, bodyStart);
        if (closeBrace === -1) continue;

        const body = source.slice(bodyStart + 1, closeBrace);

        if (!functions.some((f) => f.name === name)) {
            functions.push({
                name,
                body,
                isExported: isExport,
                startIdx: match.index,
                endIdx: closeBrace,
            });
        }
    }

    // Pattern 2B: Exports/Module.exports variable assignment (without space between dot and name)
    // Matches: exports.name = async(...) => { OR module.exports.name = function(...) {
    // Groups: 1=exports prefix, 2=name, 3=async, 4==>{ or function(
    const exportsAssignFnRegex = /\b(exports|module\.exports)\.(\w+)\s*=\s*(async\s+)?\s*(?:\([^)]*\)|[\w$]+)?\s*(=>\s*\{|function\s*\()/g;

    while ((match = exportsAssignFnRegex.exec(source)) !== null) {
        const name = match[2];
        const functionType = match[4];

        const isExport = true;

        let bodyStart = -1;
        if (functionType && functionType.startsWith("=>")) {
            bodyStart = match.index + match[0].length - 1; // position of {
        } else {
            const openParenIdx = source.indexOf("(", match.index + match[0].length - 30);
            const closeParenIdx = findClosingParen(source, openParenIdx);
            if (closeParenIdx === -1) continue;
            bodyStart = source.indexOf("{", closeParenIdx);
        }

        if (bodyStart === -1) continue;

        const closeBrace = findClosingBrace(source, bodyStart);
        if (closeBrace === -1) continue;

        const body = source.slice(bodyStart + 1, closeBrace);

        if (!functions.some((f) => f.name === name)) {
            functions.push({
                name,
                body,
                isExported: isExport,
                startIdx: match.index,
                endIdx: closeBrace,
            });
        }
    }

    // Parse bottom-level module.exports object or export statement
    // e.g. module.exports = { index, createListing };
    const moduleExportsRegex = /\bmodule\.exports\s*=\s*\{([^}]+)\}/g;
    while ((match = moduleExportsRegex.exec(source)) !== null) {
        const exportedNames = match[1].split(",").map((n) => n.trim().split(":")[0].trim());
        for (const name of exportedNames) {
            const fn = functions.find((f) => f.name === name);
            if (fn) fn.isExported = true;
        }
    }

    // e.g. export { index, createListing };
    const esExportsRegex = /\bexport\s*\{([^}]+)\}/g;
    while ((match = esExportsRegex.exec(source)) !== null) {
        const exportedNames = match[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0].trim());
        for (const name of exportedNames) {
            const fn = functions.find((f) => f.name === name);
            if (fn) fn.isExported = true;
        }
    }

    return functions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Function Body Analyzer
// ─────────────────────────────────────────────────────────────────────────────

function analyzeFunctionBody(body) {
    const operations = new Set();
    const models = new Set();
    const methods = new Set();

    // 1. Detect Mongoose/DB Model interactions
    // Pattern: Model.method() where Model starts with Capital letter
    const methodPattern = MONGOOSE_METHODS.join("|");
    const dbCallRegex = new RegExp(`\\b([A-Z]\\w*)\\s*\\.\\s*(${methodPattern})\\b`, "g");

    let match;
    while ((match = dbCallRegex.exec(body)) !== null) {
        const modelName = match[1];
        const methodName = match[2];

        models.add(modelName);
        methods.add(methodName);

        // Map method to capabilities
        const mappedOps = METHOD_CAPABILITY_MAP[methodName] || [];
        for (const op of mappedOps) {
            // Replace generic "Listings" or "Listing" with the actual model name
            const dynamicOp = op
                .replace("Listings", pluralize(modelName))
                .replace("Listing", modelName);
            operations.add(dynamicOp);
        }
    }

    // Also look for instantiation of models: new Listing(...)
    const newModelRegex = /\bnew\s+([A-Z]\w*)\b/g;
    while ((match = newModelRegex.exec(body)) !== null) {
        const modelName = match[1];
        models.add(modelName);
        methods.add("save");
        operations.add(`Create ${modelName}`);
    }

    // 2. Detect Integrations
    for (const integration of INTEGRATION_MAP) {
        if (integration.pattern.test(body)) {
            operations.add(integration.op);
        }
    }

    return {
        operations: Array.from(operations),
        models: Array.from(models),
        methods: Array.from(methods),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Utilities
// ─────────────────────────────────────────────────────────────────────────────

function pluralize(name) {
    if (name.endsWith("y") && !/[aeiou]y$/i.test(name)) {
        return name.slice(0, -1) + "ies";
    }
    if (name.endsWith("s") || name.endsWith("x") || name.endsWith("z") || name.endsWith("ch") || name.endsWith("sh")) {
        return name + "es";
    }
    return name + "s";
}

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
