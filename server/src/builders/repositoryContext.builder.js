import * as repositoryAnalyzer from "../analyzers/repository.analyzer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_CATEGORIES = new Set([
    "controllers", "controller",
    "routes", "route",
    "models", "model",
    "middlewares", "middleware",
    "config",
]);

const ALLOWED_EXPLICIT_FILES = new Set([
    "package.json",
    "server.js",
    "app.js",
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
 * This version moves PushDoc from a basic "raw file dumper" to a highly structured
 * context system. It formats the output of all intelligence analyzers (Package,
 * Route, Model, Controller, and Feature) before appending a minimized raw source dump.
 * This guarantees the LLM understands 95% of the codebase architecture and features
 * before seeing any code.
 */
export const buildRepositoryContext = (repository, precalculatedKnowledge) => {
    let context = "";

    // 1. Run all repository intelligence analyzers
    const knowledge = precalculatedKnowledge || repositoryAnalyzer.analyzeRepository(repository);

    // 2. Format PROJECT section
    const packageInfo = knowledge.package;
    if (packageInfo) {
        context += buildProjectSection(packageInfo);
        context += buildTechStackSection(packageInfo);
    }

    // 3. Format APPLICATION FEATURES section
    if (knowledge.features) {
        context += buildFeaturesSection(knowledge.features);
    }

    // 4. Format API OVERVIEW section
    if (knowledge.routes && knowledge.routes.length > 0) {
        context += buildApiOverviewSection(knowledge.routes);
    }

    // 5. Format DATABASE MODELS section
    if (knowledge.models && knowledge.models.length > 0) {
        context += buildModelsSection(knowledge.models);
    }

    // 6. Format CONTROLLERS section
    if (knowledge.controllers && knowledge.controllers.length > 0) {
        context += buildControllersSection(knowledge.controllers);
    }

    // 7. Append minimized RAW SOURCE code
    context += buildRawSourceSection(repository.files);

    return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section Builders
// ─────────────────────────────────────────────────────────────────────────────

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

function buildRawSourceSection(files) {
    let section = `================================================================================
RAW SOURCE CODE
================================================================================\n`;

    let codeFilesIncluded = 0;

    for (const file of files) {
        if (shouldIncludeRawSource(file)) {
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

function shouldIncludeRawSource(file) {
    const cat = (file.category || "").toLowerCase();
    const basename = file.path.split(/[/\\]/).pop().toLowerCase();

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