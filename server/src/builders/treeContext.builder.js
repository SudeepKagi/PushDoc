/**
 * Tree & Deterministic Tier-1 Context Builder — treeContext.builder.js
 *
 * Formats static analysis file-tree representations, framework entry points,
 * and raw source code inclusion filters for the AI repository context document.
 */

// ── Category Sets ────────────────────────────────────────────────────────────

export const ALLOWED_CATEGORIES = Object.freeze(new Set([
    "controllers", "controller",
    "routes", "route",
    "models", "model",
    "middlewares", "middleware",
    "config",
    "services", "service",
    "workers", "worker",
    "pipelines", "pipeline"
]));

export const FRONTEND_CATEGORIES = Object.freeze(new Set([
    "pages", "page",
    "components", "component",
    "hooks", "hook",
    "context",
    "store",
    "views", "view",
    "screens", "screen",
    "layouts", "layout",
    "utils", "util",
    "helpers", "helper",
    "lib",
]));

export const ALLOWED_EXPLICIT_FILES = Object.freeze(new Set([
    "package.json",
    "server.js",
    "app.js",
    "readme.md",
]));

export const FRONTEND_EXPLICIT_FILES = Object.freeze(new Set([
    "package.json",
    "app.jsx",
    "app.tsx",
    "app.js",
    "main.jsx",
    "main.tsx",
    "index.jsx",
    "index.tsx",
    "readme.md",
]));

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the Zero-LLM Tier-1 deterministic header.
 * Formatted entirely from static analysis facts (framework, entry points, package scripts).
 *
 * @param {Array<{ path: string, content: string }>} files
 * @param {object} knowledge
 * @returns {string} Formatted markdown text
 */
export function buildTier1Section(files, knowledge) {
    const fileNames = new Set(
        (files || []).map(f => f.path.replace(/\\/g, "/").split("/").pop().toLowerCase())
    );
    const allPaths = (files || []).map(f => f.path.replace(/\\/g, "/").toLowerCase());

    const deps = {
        ...(knowledge.package?.project?.dependencies || {}),
        ...(knowledge.package?.project?.devDependencies || {}),
    };

    const frameworks = [];
    if (fileNames.has("next.config.js") || fileNames.has("next.config.ts") || deps["next"]) {
        frameworks.push("Next.js");
    }
    if (fileNames.has("vite.config.js") || fileNames.has("vite.config.ts") || deps["vite"]) {
        frameworks.push("Vite");
    }
    if (fileNames.has("astro.config.mjs") || deps["astro"]) {
        frameworks.push("Astro");
    }
    if (fileNames.has("nuxt.config.js") || deps["nuxt"] || deps["nuxt3"]) {
        frameworks.push("Nuxt");
    }
    if (fileNames.has("svelte.config.js") || deps["svelte"] || deps["@sveltejs/kit"]) {
        frameworks.push("SvelteKit");
    }
    if (deps["express"]) frameworks.push("Express");
    if (deps["fastify"]) frameworks.push("Fastify");
    if (deps["nestjs"] || deps["@nestjs/core"]) frameworks.push("NestJS");
    if (deps["koa"])    frameworks.push("Koa");

    const entryPointCandidates = [
        "server.js", "server.ts", "app.js", "app.ts",
        "index.js", "index.ts",
        "main.js", "main.ts", "main.jsx", "main.tsx",
        "src/index.js", "src/index.ts", "src/main.js", "src/main.ts",
    ];
    const entryPoints = entryPointCandidates.filter(ep =>
        allPaths.some(p => p.endsWith(ep))
    );

    const scripts = knowledge.package?.project?.scripts || {};
    const scriptLines = Object.entries(scripts)
        .map(([name, cmd]) => `  ${name.padEnd(14)} ${cmd}`)
        .join("\n");

    let section = `================================================================================
TIER-1 DETERMINISTIC FACTS (zero LLM calls — static analysis only)
================================================================================\n`;

    section += `Detected Frameworks: ${frameworks.length > 0 ? frameworks.join(", ") : "None detected"}\n`;
    section += `Entry Points:        ${entryPoints.length > 0 ? entryPoints.join(", ") : "Not detected"}\n`;

    if (scriptLines) {
        section += `\nPackage Scripts:\n${scriptLines}\n`;
    }

    section += "\n";
    return section;
}

/**
 * Builds a formatted ASCII directory tree representation from scanned repository files.
 *
 * @param {Array<{ path: string }>} files
 * @returns {string} Formatted section
 */
export function buildFolderStructureSection(files) {
    const topLevelDirs = new Set();
    const topLevelFiles = new Set();
    const dirChildren = {};

    for (const file of (files || [])) {
        const parts = file.path.replace(/\\/g, "/").split("/");
        if (parts.length === 1) {
            topLevelFiles.add(parts[0]);
        } else {
            topLevelDirs.add(parts[0]);
            const dir = parts[0];
            const child = parts[1];
            if (!dirChildren[dir]) dirChildren[dir] = new Set();
            dirChildren[dir].add(child);
        }
    }

    const treeLines = [];
    const rootDirs = [...topLevelDirs].sort();
    const rootFiles = [...topLevelFiles].sort();

    for (let i = 0; i < rootDirs.length; i++) {
        const dir = rootDirs[i];
        const isLast = i === rootDirs.length - 1 && rootFiles.length === 0;
        treeLines.push(`${isLast ? "└──" : "├──"} ${dir}/`);
        const children = dirChildren[dir] ? [...dirChildren[dir]].sort() : [];
        for (let j = 0; j < children.length; j++) {
            const child = children[j];
            const childIsLast = j === children.length - 1;
            const prefix = isLast ? "    " : "│   ";
            treeLines.push(`${prefix}${childIsLast ? "└──" : "├──"} ${child}`);
        }
    }
    for (const f of rootFiles) {
        treeLines.push(`├── ${f}`);
    }

    return `================================================================================
FOLDER STRUCTURE (actual files scanned)
================================================================================
\`\`\`
${treeLines.join("\n")}
\`\`\`

`;
}

/**
 * Determines whether a file should be included in the raw source section.
 */
export function shouldIncludeRawSource(file, projectType = "backend") {
    const cat      = (file.category || "").toLowerCase();
    const basename = file.path.split(/[/\\]/).pop().toLowerCase();

    if (projectType === "frontend") {
        if (FRONTEND_CATEGORIES.has(cat)) return true;
        if (FRONTEND_EXPLICIT_FILES.has(basename)) return true;
        return false;
    }

    if (ALLOWED_CATEGORIES.has(cat)) return true;
    if (ALLOWED_EXPLICIT_FILES.has(basename)) return true;

    return false;
}

/**
 * Returns the markdown code fence language identifier for a file extension.
 */
export function getLanguage(extension) {
    const map = {
        ".js": "javascript",
        ".ts": "typescript",
        ".jsx": "jsx",
        ".tsx": "tsx",
        ".json": "json",
        ".md": "markdown",
        ".html": "html",
        ".css": "css",
        ".scss": "scss",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".py": "python",
        ".java": "java",
        ".go": "go",
        ".rs": "rust",
    };
    return map[extension] || "";
}
