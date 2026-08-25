/**
 * Analyzer Plugin Interface — analyzer.interface.js
 *
 * Defines the contract every language/framework analyzer plugin must implement.
 * All plugins are adapters — they translate language-specific signals into
 * Common Fact Model objects (see fact.schema.js).
 *
 * INTERFACE CONTRACT
 * ──────────────────
 * Every plugin must implement three methods:
 *
 *   detect(serviceFiles, manifestInfo) → boolean
 *     Returns true if this plugin can handle the given set of files.
 *     The orchestrator calls detect() on every registered plugin in priority
 *     order and uses the first one that returns true.
 *
 *   analyze(serviceFiles, manifestInfo, serviceName) → Fact[]
 *     Performs the actual analysis and returns an array of normalized Fact
 *     objects. Must never throw — return [] on any error and emit to parseErrors.
 *
 *   confidence() → "high" | "medium" | "low"
 *     Returns the plugin's overall confidence level. Used by the orchestrator
 *     to log which analysis method was applied and to label facts in the
 *     AI context. "high" = AST-based, "medium" = regex, "low" = heuristic.
 *
 *   name() → string
 *     Human-readable plugin name for logging and diagnostics.
 *
 * EXTENSION GUIDE
 * ───────────────
 * To add a new language (e.g. Rust, Elixir):
 *
 *   1. Create `plugins/<lang>/index.js`
 *   2. Extend AnalyzerPlugin
 *   3. Implement detect(), analyze(), confidence(), name()
 *   4. Register in `core/analyzer.registry.js`
 *
 * That's all. No changes to repository.analyzer.js, context builder, or AI layer.
 */

export class AnalyzerPlugin {

    /**
     * Returns true if this plugin can handle the given service files.
     *
     * @param {Array<{path, content, extension}>} serviceFiles
     * @param {object} manifestInfo — output of package.analyzer.analyzePackage()
     * @returns {boolean}
     */
    // eslint-disable-next-line no-unused-vars
    detect(serviceFiles, manifestInfo) {
        throw new Error(`${this.name()} must implement detect()`);
    }

    /**
     * Analyzes the service files and returns normalized Common Fact Model objects.
     *
     * @param {Array<{path, content, extension}>} serviceFiles
     * @param {object} manifestInfo — output of package.analyzer.analyzePackage()
     * @param {string} [serviceName] — logical service name (for monorepos)
     * @returns {{ facts: Fact[], parseErrors: Array<{file, error}> }}
     */
    // eslint-disable-next-line no-unused-vars
    analyze(serviceFiles, manifestInfo, serviceName) {
        throw new Error(`${this.name()} must implement analyze()`);
    }

    /**
     * Returns the confidence tier for this plugin's output.
     * Used for logging and fact labelling.
     *
     * @returns {"high" | "medium" | "low"}
     */
    confidence() {
        return "low";
    }

    /**
     * Human-readable name for logging and diagnostics.
     * @returns {string}
     */
    name() {
        return "UnnamedPlugin";
    }

    /**
     * Declares analyzer capabilities for selective dispatch and diagnostics.
     * @returns {{ languages: string[], frameworks: string[], produces: string[] }}
     */
    getCapabilities() {
        return {
            languages: [],
            frameworks: [],
            produces: ["endpoint", "datastore", "envvar", "dependency", "servicecall", "event"],
        };
    }

    // ── Helpers available to all subclasses ────────────────────────────────

    /**
     * Returns all files matching a given extension (case-insensitive).
     */
    filterByExtension(files, ...exts) {
        const extSet = new Set(exts.map(e => e.toLowerCase()));
        return files.filter(f => extSet.has((f.extension || "").toLowerCase()));
    }

    /**
     * Returns all files whose path contains a given pattern.
     */
    filterByPathPattern(files, pattern) {
        return files.filter(f => pattern.test(f.path));
    }

    /**
     * Finds a single file by basename (case-insensitive).
     */
    findByName(files, name) {
        const lower = name.toLowerCase();
        return files.find(f =>
            f.path.replace(/\\/g, "/").split("/").pop().toLowerCase() === lower
        );
    }
}
