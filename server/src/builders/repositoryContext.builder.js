/**
 * Repository Context Builder — repositoryContext.builder.js (Production Modular V6)
 *
 * Assembles the structured prompt context document delivered to the AI model.
 * Incorporates Tier-1 deterministic facts, Architecture Graph & relationship topology,
 * contract inconsistency warnings, Common Fact Model endpoints, database models,
 * and RAG semantic chunks (for large repositories).
 */

import * as logger from "../services/logger.service.js";
import { config } from "../config/app.config.js";
import { selectTopFiles } from "../analyzers/dependency.graph.js";
import * as embeddingService from "../services/embedding.service.js";
import * as retrievalService from "../services/retrieval.service.js";

import {
    buildTier1Section,
    buildFolderStructureSection,
    shouldIncludeRawSource,
    getLanguage,
} from "./treeContext.builder.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INTEGRATION_OPS_MAP = {
    sendEmail: "Send Email (Mail Service)",
    chargeCard: "Process Payment (Stripe/Payment Gateway)",
    generateToken: "Token Generation (Auth/JWT)",
    verifyToken: "Token Verification (Auth/JWT)",
    hashPassword: "Password Hashing (bcrypt/argon2)",
    comparePassword: "Password Comparison (bcrypt/argon2)",
    uploadToCloud: "Cloud Storage Upload",
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the complete prompt context for the LLM.
 *
 * @param {object} repository - Scanned repository files and metadata
 * @param {object} knowledge  - Output of repository.analyzer.js
 * @returns {Promise<string>} Fully formatted context string
 */
export const buildRepositoryContext = async (repository, knowledge) => {
    let context = "";

    // 1. Tier-1 Zero-LLM Deterministic Header
    context += buildTier1Section(repository.files, knowledge);

    // 2. Monorepo Service Topology (if applicable)
    if (knowledge.isMonorepo && knowledge.services?.length > 0) {
        context += buildServicesSection(knowledge.services);
    }

    // 3. Architecture Graph & Relationship Topology
    if (knowledge.architectureGraph) {
        context += buildArchitectureGraphSection(knowledge.architectureGraph, knowledge.conflicts || []);
    }

    // 4. Project Information
    if (knowledge.package) {
        context += buildProjectSection(knowledge.package);
    }

    // 5. Tech Stack & Dependencies
    if (knowledge.package) {
        context += buildTechStackSection(knowledge.package);
        context += buildDependenciesSection(knowledge.package);
    }

    // 6. Folder Structure
    context += buildFolderStructureSection(repository.files);

    // 7. Inferred Application Features
    if (knowledge.features) {
        context += buildFeaturesSection(knowledge.features);
    }

    // 8. Deterministic AST Facts
    if (knowledge.ast) {
        context += buildAstSection(knowledge.ast);
    }

    // 9. API Overview
    const endpointsFromFacts = (knowledge.facts || [])
        .filter(f => f.type === "endpoint")
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    if (endpointsFromFacts.length > 0) {
        context += buildApiOverviewFromFacts(endpointsFromFacts);
    } else if (knowledge.routes && knowledge.routes.length > 0) {
        context += buildApiOverviewSection(knowledge.routes);
    }

    // 10. Database Models
    if (knowledge.models && knowledge.models.length > 0) {
        context += buildModelsSection(knowledge.models);
    }

    // 11. Controllers
    if (knowledge.controllers && knowledge.controllers.length > 0) {
        context += buildControllersSection(knowledge.controllers);
    }

    // 12. Raw Source / RAG Retrieval
    const projectType = knowledge.projectType?.type || "backend";
    const RAG_THRESHOLD_FILE_COUNT = 40;

    if (repository.files && repository.files.length > RAG_THRESHOLD_FILE_COUNT) {
        try {
            const topN = config.rag?.topNFiles || 15;
            const candidateFiles = selectTopFiles(repository.files, topN);
            logger.info(`RAG: selected ${candidateFiles.length}/${repository.files.length} files by centrality for embedding`);

            const chunks = embeddingService.chunkRepository(candidateFiles);
            const vectorIndex = await embeddingService.buildVectorIndex(chunks);

            const topNChunks = config.rag?.topNChunks || 8;
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

        const fileCount = repository.files.length;
        const budget = fileCount > 150
            ? config.tokenBudget?.large || 160_000
            : fileCount > 40
                ? config.tokenBudget?.medium || 120_000
                : config.tokenBudget?.small || 80_000;

        if (context.length > budget) {
            logger.warn(`Context (${context.length} chars) exceeded budget (${budget} chars) — truncating`);
            context = context.slice(0, budget);
        }

        return context;
    }

    context += buildRawSourceSection(repository.files, projectType);
    return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// Section Builders
// ─────────────────────────────────────────────────────────────────────────────

function buildArchitectureGraphSection(graph, conflicts = []) {
    let section = `================================================================================\r\nARCHITECTURE GRAPH & RELATIONSHIP TOPOLOGY\r\n================================================================================\n`;

    const nodes = graph.getAllNodes ? graph.getAllNodes() : (graph.nodes || []);
    section += `Discovered Components (${nodes.length}):\n`;
    for (const node of nodes) {
        const fw = node.framework ? ` (${node.framework})` : "";
        const lang = node.language && node.language !== "Unknown" ? ` [${node.language}]` : "";
        section += `  • [${node.type.toUpperCase()}] ${node.label}${lang}${fw} — ${node.componentType || node.type}\n`;
    }

    const edges = graph.getAllEdges ? graph.getAllEdges() : (graph.edges || []);
    if (edges.length > 0) {
        section += `\nInter-Component Relationships & Calls (${edges.length}):\n`;
        for (const edge of edges) {
            const proto = edge.protocol ? ` via ${edge.protocol}` : "";
            const details = edge.method && edge.path ? ` [${edge.method} ${edge.path}]` : edge.label ? ` [${edge.label}]` : "";
            section += `  • ${edge.from} ──(${edge.type}${details}${proto})──> ${edge.to}\n`;
        }
    }

    if (conflicts && conflicts.length > 0) {
        section += `\n⚠️ CONTRACT & ENVIRONMENT INCONSISTENCIES (${conflicts.length}):\n`;
        for (const c of conflicts) {
            const title = c.title || c.value?.title || "Inconsistency";
            const desc = c.description || c.value?.description || "";
            const severity = (c.severity || c.value?.severity || "warning").toUpperCase();
            section += `  • [${severity}] ${title}: ${desc}\n`;
            if (c.expected || c.value?.expected) {
                section += `      Expected: ${c.expected || c.value?.expected}\n      Actual:   ${c.actual || c.value?.actual}\n`;
            }
        }
    }

    section += "\n";
    return section;
}

function buildServicesSection(services) {
    let section = `================================================================================\r\nMONOREPO / POLYGLOT SERVICE TOPOLOGY\r\n================================================================================\n`;
    section += `This repository contains ${services.length} independent services:\n\n`;

    for (const svc of services) {
        section += `  Service: ${svc.name}\n`;
        section += `    Path:      ${svc.path || "."}\n`;
        section += `    Language:  ${svc.language || "Unknown"}\n`;
        section += `    Ecosystem: ${svc.ecosystem || "unknown"}\n`;
        if (svc.framework) {
            section += `    Framework: ${svc.framework}\n`;
        }
        if (svc.evidence && svc.evidence.length > 0) {
            section += `    Detected:  ${svc.evidence[0]}\n`;
        }
        section += "\n";
    }

    return section;
}

function buildApiOverviewFromFacts(endpointFacts) {
    let section = `================================================================================\r\nAPI ENDPOINTS (extracted from source code / specs)\r\n================================================================================\n`;

    const byService = {};
    for (const ep of endpointFacts) {
        const key = ep.service || "(root)";
        if (!byService[key]) byService[key] = [];
        byService[key].push(ep);
    }

    for (const [svcName, eps] of Object.entries(byService)) {
        if (Object.keys(byService).length > 1) {
            section += `\n  [${svcName}]\n`;
        }
        for (const ep of eps) {
            const method  = (ep.method || "").padEnd(8);
            const path    = ep.path || "/";
            const handler = ep.handler ? ` → ${ep.handler}` : "";
            const conf    = ep.confidence !== undefined
                ? ` (confidence: ${(ep.confidence * 100).toFixed(0)}%)`
                : "";
            section += `  ${method} ${path}${handler}${conf}\n`;
        }
    }

    section += "\n";
    return section;
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
    const db   = tech.database?.length ? tech.database.join(", ") : "None";
    const auth = tech.authentication?.length ? tech.authentication.join(", ") : "None";
    const stor = tech.storage?.length ? tech.storage.join(", ") : "None";

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

function buildDependenciesSection(packageInfo) {
    let section = `================================================================================
DEPENDENCIES
================================================================================
`;
    if (packageInfo.runtimeDependencies?.length > 0) {
        section += `Runtime Dependencies:\n${packageInfo.runtimeDependencies.map(d => `  - ${d}`).join("\n")}\n\n`;
    }
    if (packageInfo.devDependencies?.length > 0) {
        section += `Development Dependencies:\n${packageInfo.devDependencies.map(d => `  - ${d}`).join("\n")}\n\n`;
    }
    return section;
}

function buildFeaturesSection(featuresData) {
    let section = `================================================================================
APPLICATION FEATURES
================================================================================\n`;

    if (featuresData.features?.length > 0) {
        for (const feat of featuresData.features) {
            section += `- **${feat.title}**: ${feat.description}\n`;
        }
    } else {
        section += "No application features identified.\n";
    }

    section += `\n================================================================================
CAPABILITIES
================================================================================\n`;

    if (featuresData.capabilities?.length > 0) {
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

    if (ast.apiCalls?.length > 0) {
        section += `## Extracted Frontend API Call Sites:\n`;
        for (const call of ast.apiCalls) {
            section += `- Method: ${call.method} | Client: ${call.client} | URL: \`${call.url}\` (File: ${call.file})\n`;
        }
        section += "\n";
    }

    if (ast.expressRoutes?.length > 0) {
        section += `## Extracted Express Routes:\n`;
        for (const route of ast.expressRoutes) {
            section += `- ${route.method.padEnd(6)} ${route.path} (File: ${route.file})\n`;
        }
        section += "\n";
    }

    if (ast.envVars?.length > 0) {
        section += `## Environment Variables Referenced in Code (process.env):\n`;
        for (const envKey of ast.envVars) {
            section += `- ${envKey}\n`;
        }
        section += "\n";
    }

    if (ast.envFileVars?.length > 0) {
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
            const mwLine = route.middlewares?.length > 0
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
        if (model.fields?.length > 0) {
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
        if (model.indexes?.length > 0) {
            for (const idx of model.indexes) {
                section += `  - ${idx}\n`;
            }
        } else {
            section += `  None\n`;
        }

        section += `\n### Hooks:\n`;
        if (model.middleware?.length > 0) {
            for (const hook of model.middleware) {
                section += `  - ${hook}\n`;
            }
        } else {
            section += `  None\n`;
        }

        section += `\n### Plugins:\n`;
        if (model.plugins?.length > 0) {
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
            const modelsText = exp.models?.length > 0 ? exp.models.join(", ") : "None";
            const methodsText = exp.methods?.length > 0 ? exp.methods.join(", ") : "None";

            section += `    - Business Operations:  ${opsText}\n`;
            section += `    - Database Models:      ${modelsText} (using ${methodsText})\n`;
            section += `    - External Integrations: ${intsText}\n\n`;
        }
        section += `--------------------------------------------------------------------------------\n\n`;
    }

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

function buildRawSourceSection(files, projectType = "backend") {
    let section = `================================================================================
RAW SOURCE CODE
================================================================================\n`;

    const isFrontend = projectType === "frontend";
    const MAX_FRONTEND_FILES = 10;
    let codeFilesIncluded = 0;

    const orderedFiles = isFrontend
        ? [
            ...(files || []).filter(f => (f.category || "").toLowerCase().startsWith("page")),
            ...(files || []).filter(f => !((f.category || "").toLowerCase().startsWith("page"))),
          ]
        : (files || []);

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