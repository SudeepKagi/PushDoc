import * as repositoryAnalyzer from "../analyzers/repository.analyzer.js";
import * as embeddingService  from "../services/embedding.service.js";
import * as retrievalService  from "../services/retrieval.service.js";
import * as dependencyGraph   from "../analyzers/dependency.graph.js";
import { config }             from "../config/app.config.js";
import * as logger            from "../services/logger.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_CATEGORIES = new Set([
    "controllers", "controller",
    "routes", "route",
    "models", "model",
    "middlewares", "middleware",
    "config",
    "services", "service",
    "workers", "worker",
    "pipelines", "pipeline"
]);

const FRONTEND_CATEGORIES = new Set([
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
]);

const ALLOWED_EXPLICIT_FILES = new Set([
    "package.json",
    "server.js",
    "app.js",
    "readme.md",
]);

const FRONTEND_EXPLICIT_FILES = new Set([
    "package.json",
    "app.jsx",
    "app.tsx",
    "app.js",
    "main.jsx",
    "main.tsx",
    "index.jsx",
    "index.tsx",
    "readme.md",
]);

// Map operations back to their integration names for clear display
const INTEGRATION_OPS_MAP = {
    "Upload Image":         "Cloudinary (Image Upload)",
    "Geocode Location":     "Mapbox (Geocoding)",
    "Process Payment":      "Stripe/Razorpay (Payments)",
    "Cache Data":           "Redis (Caching)",
    "Background Jobs":      "BullMQ (Queue)",
    "Generate Token":       "JWT (Token Generation)",
    "Authenticate User":    "Passport (Authentication)",
    "Send Email":           "Nodemailer (Email Service)",
    "Firebase Integration": "Firebase",
    "AI Generation":        "OpenAI/Gemini/Groq (AI Services)",
    "External API Call":    "Axios/Fetch (API Client)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a structured repository knowledge context document.
 *
 * Implements Size-Threshold Branching:
 * - Repos <= 40 files: Full deterministic AST + key raw source files (0 retrieval latency)
 * - Repos > 40 files : In-memory RAG via Gemini text-embedding-004 to pull top relevant chunks
 */
export const buildRepositoryContext = async (repository, precalculatedKnowledge) => {
    let context = "";

    // 1. Run all repository intelligence analyzers
    const knowledge = precalculatedKnowledge || repositoryAnalyzer.analyzeRepository(repository);
    const projectType = knowledge.projectType || "backend";

    // 2. Tier-1: Zero-LLM deterministic header — built from static analysis only.
    // This section always appears first and never requires an AI call, so it
    // cannot hallucinate. The LLM sees the framework, entry points, and tree
    // before any generated text.
    context += buildTier1Section(repository.files, knowledge);

    // 3. Inject project type
    context += `================================================================================\r\nPROJECT TYPE: ${projectType.toUpperCase()}\r\n================================================================================\r\n\r\n`;

    // 4. Format PROJECT section
    const packageInfo = knowledge.package;
    if (packageInfo) {
        context += buildProjectSection(packageInfo);
        context += buildTechStackSection(packageInfo);
    }

    // 5. Format FOLDER STRUCTURE section (derived from actual file paths)
    context += buildFolderStructureSection(repository.files);

    // 6. Format APPLICATION FEATURES section
    if (knowledge.features) {
        context += buildFeaturesSection(knowledge.features);
    }

    // 7. Format DETERMINISTIC AST FACTS section (API calls, process.env, .env.example)
    if (knowledge.ast) {
        context += buildAstSection(knowledge.ast);
    }

    // 8. Format API OVERVIEW section (backend/fullstack only)
    if (knowledge.routes && knowledge.routes.length > 0) {
        context += buildApiOverviewSection(knowledge.routes);
    }

    // 9. Format DATABASE MODELS section (backend/fullstack only)
    if (knowledge.models && knowledge.models.length > 0) {
        context += buildModelsSection(knowledge.models);
    }

    // 10. Format CONTROLLERS section (backend/fullstack only)
    if (knowledge.controllers && knowledge.controllers.length > 0) {
        context += buildControllersSection(knowledge.controllers);
    }

    // 11. Raw Source Inclusion: Branch by repository size
    const RAG_THRESHOLD_FILE_COUNT = 40;
    if (repository.files && repository.files.length > RAG_THRESHOLD_FILE_COUNT) {
        try {
            // Select only the top-N most-imported files for embedding.
            // This limits embedding API calls to the architecturally important files.
            const topN = config.rag.topNFiles;
            const candidateFiles = dependencyGraph.selectTopFiles(repository.files, topN);
            logger.info(`RAG: selected ${candidateFiles.length}/${repository.files.length} files by centrality for embedding`);

            const chunks = embeddingService.chunkRepository(candidateFiles);
            const vectorIndex = await embeddingService.buildVectorIndex(chunks);

            const topNChunks = config.rag.topNChunks;
            const relevantChunks = await retrievalService.queryVectorIndex(
                vectorIndex,
                "Main application entry point, core features, API routes, data flow, external integrations",
                topNChunks
            );

            context += buildRagSourceSection(relevantChunks);
        } catch (err) {
            logger.warn(`RAG embedding failed, falling back to raw source: ${err.message}`);
            context += buildRawSourceSection(repository.files, projectType);
        }

        // Apply token budget: if context exceeds the limit for this repo's size tier,
        // truncate at the char limit. We truncate from the end so the deterministic
        // Tier-1 section (which comes first) is always preserved.
        const fileCount = repository.files.length;
        const budget = fileCount > 150
            ? config.tokenBudget.large
            : fileCount > 40
                ? config.tokenBudget.medium
                : config.tokenBudget.small;

        if (context.length > budget) {
            logger.warn(`Context (${context.length} chars) exceeded budget (${budget} chars) — truncating`);
            context = context.slice(0, budget);
        }

        return context;
    }

    // Default for small repos (<= 40 files)
    context += buildRawSourceSection(repository.files, projectType);

    return context;
};

/**
 * Tier-1 Zero-LLM Section
 *
 * Built entirely from static analysis — no AI calls, no retrieval.
 * Detects the framework, entry points, and scripts from the file list and
 * package.json. This section always appears first in the context so the model
 * sees deterministic facts before any retrieved or generated content.
 */
function buildTier1Section(files, knowledge) {
    const fileNames = new Set(
        (files || []).map(f => f.path.replace(/\\/g, "/").split("/").pop().toLowerCase())
    );
    const allPaths = (files || []).map(f => f.path.replace(/\\/g, "/").toLowerCase());

    // ── Framework detection ──────────────────────────────────────────────
    // Check for framework-specific config files and package.json dependencies.
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

    // ── Entry point detection ────────────────────────────────────────────
    const entryPointCandidates = [
        "server.js", "server.ts", "app.js", "app.ts",
        "index.js", "index.ts",
        "main.js", "main.ts", "main.jsx", "main.tsx",
        "src/index.js", "src/index.ts", "src/main.js", "src/main.ts",
    ];
    const entryPoints = entryPointCandidates.filter(ep =>
        allPaths.some(p => p.endsWith(ep))
    );

    // ── Package scripts ──────────────────────────────────────────────────
    const scripts = knowledge.package?.project?.scripts || {};
    const scriptLines = Object.entries(scripts)
        .map(([name, cmd]) => `  ${name.padEnd(14)} ${cmd}`)
        .join("\n");

    // ── Assemble section ─────────────────────────────────────────────────
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

function buildRagSourceSection(relevantChunks) {
    let section = `================================================================================
SEMANTICALLY RETRIEVED CODE CHUNKS (RAG Engine)
================================================================================\n`;

    for (const chunk of relevantChunks) {
        section += `\n================================================================================\n`;
        section += `FILE: ${chunk.filePath} (Lines ${chunk.startLine}-${chunk.endLine}, Similarity Score: ${(chunk.score || 0).toFixed(3)})\n`;
        section += `================================================================================\n`;
        section += `\`\`\`\n`;
        section += `${chunk.content}\n`;
        section += `\`\`\`\n`;
    }

    return section;
}



// ─────────────────────────────────────────────────────────────────────────────
// Section Builders
// ─────────────────────────────────────────────────────────────────────────────

function buildFolderStructureSection(files) {
    // Build a set of unique directory paths from actual file paths
    const dirSet = new Set();
    const fileSet = new Set();

    for (const file of files) {
        const parts = file.path.replace(/\\/g, "/").split("/");
        fileSet.add(parts[parts.length - 1]);
        // Add each directory segment
        for (let i = 0; i < parts.length - 1; i++) {
            dirSet.add(parts.slice(0, i + 1).join("/"));
        }
    }

    // Build tree as sorted unique paths
    const allPaths = [...dirSet].sort();
    const allFiles = [...fileSet].sort();

    // Show top-level structure concisely
    const topLevelDirs = new Set();
    const topLevelFiles = new Set();

    for (const file of files) {
        const parts = file.path.replace(/\\/g, "/").split("/");
        if (parts.length === 1) {
            topLevelFiles.add(parts[0]);
        } else {
            topLevelDirs.add(parts[0]);
        }
    }

    // Build a simplified tree view
    const treeLines = [];
    const rootDirs = [...topLevelDirs].sort();
    const rootFiles = [...topLevelFiles].sort();

    // For each top-level dir, collect its immediate children
    const dirChildren = {};
    for (const file of files) {
        const parts = file.path.replace(/\\/g, "/").split("/");
        if (parts.length >= 2) {
            const dir = parts[0];
            const child = parts[1];
            if (!dirChildren[dir]) dirChildren[dir] = new Set();
            dirChildren[dir].add(child);
        }
    }

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

function buildProjectSection(packageInfo) {
    const proj = packageInfo.project;
    return `================================================================================
PROJECT INFORMATION
================================================================================
Name:        ${proj.name}
Version:     ${proj.version}
Description: ${proj.description || "No description provided."}

`;
}

function buildTechStackSection(packageInfo) {
    const tech = packageInfo.technology;
    const db   = tech.database.length ? tech.database.join(", ") : "None";
    const auth = tech.authentication.length ? tech.authentication.join(", ") : "None";
    const stor = tech.storage.length ? tech.storage.join(", ") : "None";

    return `================================================================================
TECH STACK
================================================================================
Language:        ${tech.language}
Runtime:         ${tech.runtime}
Framework:       ${tech.framework}
Database:        ${db}
Authentication:  ${auth}
Storage:         ${stor}
Package Manager: ${tech.packageManager}

`;
}

function buildFeaturesSection(featuresData) {
    let section = `================================================================================
APPLICATION FEATURES
================================================================================\n`;

    if (featuresData.features && featuresData.features.length > 0) {
        for (const feat of featuresData.features) {
            section += `- **${feat.title}**: ${feat.description}\n`;
        }
    } else {
        section += "No application features identified.\n";
    }

    section += `\n================================================================================
CAPABILITIES
================================================================================\n`;

    if (featuresData.capabilities && featuresData.capabilities.length > 0) {
        for (const cap of featuresData.capabilities) {
            section += `- ${cap}\n`;
        }
    } else {
        section += "No technical capabilities identified.\n";
    }

    return section + "\n";
}

function buildAstSection(ast) {
    let section = `================================================================================
DETERMINISTIC AST EXTRACTED FACTS
================================================================================\n`;

    if (ast.apiCalls && ast.apiCalls.length > 0) {
        section += `## Extracted Frontend API Call Sites:\n`;
        for (const call of ast.apiCalls) {
            section += `- Method: ${call.method} | Client: ${call.client} | URL: \`${call.url}\` (File: ${call.file})\n`;
        }
        section += "\n";
    }

    if (ast.expressRoutes && ast.expressRoutes.length > 0) {
        section += `## Extracted Express Routes:\n`;
        for (const route of ast.expressRoutes) {
            section += `- ${route.method.padEnd(6)} ${route.path} (File: ${route.file})\n`;
        }
        section += "\n";
    }

    if (ast.envVars && ast.envVars.length > 0) {
        section += `## Environment Variables Referenced in Code (process.env):\n`;
        for (const envKey of ast.envVars) {
            section += `- ${envKey}\n`;
        }
        section += "\n";
    }

    if (ast.envFileVars && ast.envFileVars.length > 0) {
        section += `## Environment Variables Found in .env.example / .env.sample:\n`;
        for (const envItem of ast.envFileVars) {
            section += `- ${envItem.key} (File: ${envItem.sourceFile})\n`;
        }
        section += "\n";
    }

    return section;
}

function buildApiOverviewSection(routes) {
    const byFile = {};
    for (const route of routes) {
        const key = route.file || "unknown";
        if (!byFile[key]) byFile[key] = [];
        byFile[key].push(route);
    }

    let section = `================================================================================
API OVERVIEW
================================================================================\n`;

    for (const [file, fileRoutes] of Object.entries(byFile)) {
        section += `## Router: ${file}\n\n`;
        for (const route of fileRoutes) {
            const mwLine = route.middlewares.length > 0
                ? `  Middlewares: ${route.middlewares.join(", ")}\n`
                : "";
            section +=
                `  ${route.method.padEnd(7)} ${route.path}\n` +
                mwLine +
                `  Controller:  ${route.controller}\n\n`;
        }
    }

    return section;
}

function buildModelsSection(models) {
    let section = `================================================================================
DATABASE MODELS
================================================================================\n`;

    for (const model of models) {
        section += `## Model: ${model.name} (Collection: ${model.collection || "default"})\n`;
        section += `Source File: ${model.file}\n\n`;

        section += `### Fields:\n`;
        if (model.fields && model.fields.length > 0) {
            for (const field of model.fields) {
                let details = `type: ${field.type}`;
                if (field.required) details += ", required";
                if (field.unique)   details += ", unique";
                if (field.default !== undefined) details += `, default: ${field.default}`;
                if (field.ref)      details += `, ref: ${field.ref}`;
                if (field.enum)     details += `, enum: [${field.enum.join(", ")}]`;
                if (field.min !== undefined) details += `, min: ${field.min}`;
                if (field.max !== undefined) details += `, max: ${field.max}`;

                section += `  - ${field.name.padEnd(15)} { ${details} }\n`;
            }
        } else {
            section += `  (No fields detected)\n`;
        }

        section += `\n### Indexes:\n`;
        if (model.indexes && model.indexes.length > 0) {
            for (const idx of model.indexes) {
                section += `  - ${idx}\n`;
            }
        } else {
            section += `  None\n`;
        }

        section += `\n### Hooks:\n`;
        if (model.middleware && model.middleware.length > 0) {
            for (const hook of model.middleware) {
                section += `  - ${hook}\n`;
            }
        } else {
            section += `  None\n`;
        }

        section += `\n### Plugins:\n`;
        if (model.plugins && model.plugins.length > 0) {
            for (const plug of model.plugins) {
                section += `  - ${plug}\n`;
            }
        } else {
            section += `  None\n`;
        }

        section += `\n--------------------------------------------------------------------------------\n\n`;
    }

    return section;
}

function buildControllersSection(controllers) {
    let section = `================================================================================
CONTROLLERS
================================================================================\n`;

    for (const ctrl of controllers) {
        section += `## Controller: ${ctrl.controller}\n\n`;

        for (const exp of ctrl.exports || []) {
            section += `  ### Function: ${exp.name}\n`;

            // Separate integrations and business operations
            const businessOps = [];
            const integrations = [];

            for (const op of exp.operations || []) {
                if (INTEGRATION_OPS_MAP[op]) {
                    integrations.push(INTEGRATION_OPS_MAP[op]);
                } else {
                    businessOps.push(op);
                }
            }

            const opsText = businessOps.length > 0 ? businessOps.join(", ") : "None";
            const intsText = integrations.length > 0 ? integrations.join(", ") : "None";
            const modelsText = exp.models.length > 0 ? exp.models.join(", ") : "None";
            const methodsText = exp.methods.length > 0 ? exp.methods.join(", ") : "None";

            section += `    - Business Operations:  ${opsText}\n`;
            section += `    - Database Models:      ${modelsText} (using ${methodsText})\n`;
            section += `    - External Integrations: ${intsText}\n\n`;
        }
        section += `--------------------------------------------------------------------------------\n\n`;
    }

    return section;
}

function buildRawSourceSection(files, projectType = "backend") {
    let section = `================================================================================
RAW SOURCE CODE
================================================================================\n`;

    const isFrontend = projectType === "frontend";

    // For frontend projects: pages/ and explicit entry files first (most informative),
    // then other frontend categories. Cap at 10 files to avoid token overflow.
    const MAX_FRONTEND_FILES = 10;
    let codeFilesIncluded = 0;

    // Prioritise pages for frontend (they reveal what screens the app has)
    const orderedFiles = isFrontend
        ? [
            ...files.filter(f => (f.category || "").toLowerCase().startsWith("page")),
            ...files.filter(f => !((f.category || "").toLowerCase().startsWith("page"))),
          ]
        : files;

    for (const file of orderedFiles) {
        if (isFrontend && codeFilesIncluded >= MAX_FRONTEND_FILES) break;

        if (shouldIncludeRawSource(file, projectType)) {
            section += `\n================================================================================\n`;
            section += `FILE: ${file.path}\n`;
            section += `================================================================================\n`;
            section += `\`\`\`${getLanguage(file.extension)}\n`;
            section += `${file.content}\n`;
            section += `\`\`\`\n`;
            codeFilesIncluded++;
        }
    }

    if (codeFilesIncluded === 0) {
        section += "No allowed source files were selected for raw code inclusion.\n";
    }

    return section;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Helpers
// ─────────────────────────────────────────────────────────────────────────────

function shouldIncludeRawSource(file, projectType = "backend") {
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

function getLanguage(extension) {
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
    };
    return map[extension] || "";
}