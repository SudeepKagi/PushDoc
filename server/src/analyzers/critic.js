/**
 * Critic
 *
 * A post-generation pass that scans the generated README for identifiers
 * that are likely to be hallucinated: env var names, package names, and
 * HTTP route paths. Each found identifier is checked against the canonical
 * `facts` object produced by `facts.extractor.js`.
 *
 * If an identifier appears in the README but not in facts, it is flagged as
 * a violation. The pipeline can then decide how to handle violations:
 *   - Log a warning and commit anyway (current behaviour — non-blocking)
 *   - Re-generate the offending section (future enhancement)
 *   - Block the commit (future strict mode)
 *
 * Keeping the critic non-blocking is intentional: a false positive from the
 * critic is worse than a false negative (it would suppress a correct README).
 * The critic's violations are surfaced in worker logs so humans can review them.
 */

// ── Patterns ─────────────────────────────────────────────────────────────────

// Matches UPPER_SNAKE_CASE words — the pattern of env var names.
// Minimum 3 chars to avoid matching abbreviations like "OR", "DB", "ID".
const ENV_VAR_PATTERN = /\b([A-Z][A-Z0-9_]{2,})\b/g;

// Matches words inside backtick code spans: `express`, `mongoose`, etc.
// These are the most common way README authors write package names.
const CODE_SPAN_PATTERN = /`([^`\s]+)`/g;

// Matches HTTP route paths: /api/users, /auth/login, /:id, /v1/repos/:owner/:repo
// Requires at least one slash and one non-whitespace char after it.
const ROUTE_PATTERN = /\/(api|auth|v\d|admin|webhook|oauth)[/\w:.-]*/gi;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Scans a generated README for identifiers that don't appear in the facts object.
 *
 * @param {string} readme - Generated README markdown
 * @param {object} facts  - Output of extractFacts()
 * @returns {{ violations: Array<{ type: string, value: string }>, isClean: boolean }}
 */
export const critique = (readme, facts) => {
    if (!readme || !facts) {
        return { violations: [], isClean: true };
    }

    const violations = [];

    // Build lookup sets for O(1) membership checks.
    const knownEnvVars = new Set(facts.envVars.map(v => v.toUpperCase()));
    const knownPackages = new Set([
        ...facts.dependencies,
        ...facts.devDependencies,
    ].map(p => p.toLowerCase()));
    const knownRoutes = new Set(
        facts.routes.map(r => normalisePath(r.path))
    );

    // ── Check 1: Env var names ─────────────────────────────────────────────
    // Scan for UPPER_SNAKE_CASE identifiers in the README. Flag any that
    // are not in the known env vars list. We restrict to identifiers that
    // look like var names (>=3 chars, contain an underscore) to avoid matching
    // acronyms like "GET", "POST", "HTTP", "API" — these are always valid.
    ENV_VAR_PATTERN.lastIndex = 0;
    let match;
    while ((match = ENV_VAR_PATTERN.exec(readme)) !== null) {
        const token = match[1];
        const looksLikeEnvVar = token.includes("_") && token.length >= 4;
        if (looksLikeEnvVar && !knownEnvVars.has(token)) {
            // Only flag if there are known env vars to compare against.
            // If facts.envVars is empty, the project has no .env.example and
            // the critic has no ground truth — skip env var checks.
            if (knownEnvVars.size > 0) {
                violations.push({ type: "envVar", value: token });
            }
        }
    }

    // ── Check 2: Package names in code spans ──────────────────────────────
    // Scan backtick spans for npm package names. Flag any that are not in
    // the known package list. We only flag names that look like npm packages
    // (contain no spaces, no slashes other than scoped package prefix @scope/).
    if (knownPackages.size > 0) {
        CODE_SPAN_PATTERN.lastIndex = 0;
        while ((match = CODE_SPAN_PATTERN.exec(readme)) !== null) {
            const token = match[1].toLowerCase();
            const looksLikePackage = !token.includes("/") || token.startsWith("@");
            // Only flag multi-char, non-command tokens (skip `npm`, `git`, file names)
            const isCommand = ["npm", "npx", "git", "node", "yarn", "pnpm", "cd", "ls"].includes(token);
            const isFilename = token.includes(".");
            if (looksLikePackage && !isCommand && !isFilename && token.length > 2) {
                if (!knownPackages.has(token)) {
                    violations.push({ type: "package", value: token });
                }
            }
        }
    }

    // ── Check 3: Route paths ──────────────────────────────────────────────
    // Scan for HTTP route paths in the README. Flag any that are not in the
    // known routes list. Only run if we have known routes to compare against.
    if (knownRoutes.size > 0) {
        ROUTE_PATTERN.lastIndex = 0;
        while ((match = ROUTE_PATTERN.exec(readme)) !== null) {
            const normPath = normalisePath(match[0]);
            if (!knownRoutes.has(normPath)) {
                violations.push({ type: "route", value: match[0] });
            }
        }
    }

    // Deduplicate: the same identifier can match multiple times in a README
    const seen = new Set();
    const unique = violations.filter(v => {
        const key = `${v.type}:${v.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        violations: unique,
        isClean: unique.length === 0,
    };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalises an HTTP path for comparison:
 * - lowercase
 * - strip trailing slash
 * - replace path parameters (:id, :userId) with the generic placeholder `:param`
 */
function normalisePath(path) {
    return path
        .toLowerCase()
        .replace(/\/$/, "")
        .replace(/:[\w]+/g, ":param");
}
