/**
 * Facts Extractor
 *
 * Produces a canonical `facts` object from the repository's static knowledge.
 * Every field in this object is derived from code, package.json, or .env files
 * — nothing is inferred or generated. This object is used as the ground truth
 * for two purposes:
 *
 *   1. Grounding constraint: the prompt tells the model it may only reference
 *      names that appear in the facts object (packages, routes, env vars,
 *      scripts). Anything not in facts should not appear in the README.
 *
 *   2. Critic pass: the critic scans the generated README for identifiers and
 *      checks each one against facts. Unrecognised identifiers are flagged and
 *      the section is re-generated with a targeted correction prompt.
 *
 * All fields are normalised (lowercase, trimmed) for consistent comparison.
 */

/**
 * Extracts the canonical facts object from a knowledge tree.
 *
 * @param {object} knowledge - Output of repositoryAnalyzer.analyzeRepository()
 * @returns {object} facts
 */
export const extractFacts = (knowledge) => {
    if (!knowledge) {
        return emptyFacts();
    }

    // ── Package info ──────────────────────────────────────────────────────
    const pkg = knowledge.package?.project || {};

    const projectName = (pkg.name || "").trim();

    // All dependency names (prod + dev), lowercased for comparison.
    const dependencies = Object.keys(pkg.dependencies || {});
    const devDependencies = Object.keys(pkg.devDependencies || {});

    // npm scripts: [{ name: "dev", command: "nodemon server.js" }, ...]
    const scripts = Object.entries(pkg.scripts || {})
        .map(([name, command]) => ({ name, command }));

    // ── Route extraction ──────────────────────────────────────────────────
    // Only HTTP routes extracted from the route analyzer — real paths only,
    // never inferred from controller names or comments.
    const routes = (knowledge.routes || [])
        .filter(r => r.path && r.method)
        .map(r => ({
            method: r.method.toUpperCase(),
            path: r.path,
        }));

    // ── Environment variable extraction ───────────────────────────────────
    // Two sources:
    //   - envVars: process.env.FOO references found in source code (AST pass)
    //   - envFileVars: keys found in .env.example or .env.sample files
    // We merge both and deduplicate. These are the only var names the LLM
    // may mention — no invented vars like OPENAI_API_KEY if it's not here.
    const envVarsFromCode = knowledge.ast?.envVars || [];
    const envVarsFromFile = (knowledge.ast?.envFileVars || []).map(e => e.key);

    const allEnvVarNames = [...new Set([
        ...envVarsFromCode,
        ...envVarsFromFile,
    ])];

    const envVars = allEnvVarNames;

    // Keys specifically from .env.example / .env.sample (what the README
    // Environment Variables section should list — real file content, not
    // inferred references).
    const envFileVars = (knowledge.ast?.envFileVars || []).map(e => e.key);

    // ── Entry point detection ─────────────────────────────────────────────
    // Files at the root or in src/ that look like entry points.
    const ENTRY_CANDIDATES = new Set([
        "server.js", "server.ts", "app.js", "app.ts",
        "index.js", "index.ts", "main.js", "main.ts",
    ]);
    // (Used by the Tier-1 section builder in the context builder;
    //  not stored here since it's derived from files, not knowledge.)

    return {
        projectName,
        dependencies,
        devDependencies,
        scripts,
        routes,
        envVars,
        envFileVars,
    };
};

/**
 * Returns an empty facts object with the correct shape.
 * Used as a safe fallback when knowledge is missing.
 */
const emptyFacts = () => ({
    projectName: "",
    dependencies: [],
    devDependencies: [],
    scripts: [],
    routes: [],
    envVars: [],
    envFileVars: [],
});
