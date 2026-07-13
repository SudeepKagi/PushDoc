
import * as repositoryAnalyzer from "../analyzers/repository.analyzer.js";

const CATEGORY_ORDER = [
    "root",
    "controllers",
    "routes",
    "models",
    "services",
    "middlewares",
    "config",
    "views",
    "utils",
    "public",
];

export const buildRepositoryContext = (
    repository
) => {

    let context = "";

    const knowledge =
        repositoryAnalyzer.analyzeRepository(
            repository
        );

    const packageInfo =
        knowledge.package;

    if (packageInfo) {

        context += buildProjectSection(
            packageInfo
        );

    }

    context += buildMetadata(
        repository
    );

    // If the route analyzer found structured routes, emit a compact
    // API Overview section BEFORE the raw file dump.
    // This gives the AI an explicit endpoint table so it does not need
    // to re-parse route files itself — saving tokens and improving accuracy.
    if (knowledge.routes && knowledge.routes.length > 0) {

        context += buildRoutesSection(
            knowledge.routes
        );

    }

    const groupedFiles =
        groupFiles(
            repository.files
        );

    for (const category of CATEGORY_ORDER) {

        if (
            !groupedFiles[category]?.length
        ) {
            continue;
        }

        context += buildCategory(
            category,
            groupedFiles[category]
        );

    }

    return context;

};

function buildProjectSection(
    packageInfo
) {

    const auth =
        packageInfo.technology.authentication
            .length
            ? packageInfo.technology.authentication.join(", ")
            : "None";

    const database =
        packageInfo.technology.database
            .length
            ? packageInfo.technology.database.join(", ")
            : "None";

    const storage =
        packageInfo.technology.storage
            .length
            ? packageInfo.technology.storage.join(", ")
            : "None";

    const scripts =
        Object.entries(
            packageInfo.scripts
        )
            .map(
                ([name, command]) =>
                    `- ${name}: ${command}`
            )
            .join("\n");

    return `# Project Information

Project Name:
${packageInfo.project.name}

Version:
${packageInfo.project.version}

Description:
${packageInfo.project.description || "Not specified"}

Language:
${packageInfo.technology.language}

Runtime:
${packageInfo.technology.runtime}

Framework:
${packageInfo.technology.framework}

Database:
${database}

Authentication:
${auth}

Storage:
${storage}

Package Manager:
${packageInfo.technology.packageManager}

Scripts:

${scripts}

--------------------------------

`;

}

function buildMetadata(
    repository
) {

    return `# Repository

Name:
${repository.metadata.name}

Total Files:
${repository.metadata.totalFiles}

Generated:
${repository.metadata.scannedAt}

--------------------------------

`;

}

/**
 * Builds the API Overview section from the structured route data produced
 * by Route Analyzer V2.
 *
 * Format (per route):
 *   METHOD  /path
 *   Middlewares: mw1, mw2
 *   Controller:  controllerName
 *
 * Routes are grouped by source file. This keeps the section readable and
 * lets the AI understand which routes belong to which router file.
 */
function buildRoutesSection(routes) {

    // Group by file
    const byFile = {};

    for (const route of routes) {

        const key = route.file || "unknown";

        if (!byFile[key]) {
            byFile[key] = [];
        }

        byFile[key].push(route);

    }

    let section = `# API Overview\n\n`;

    for (const [file, fileRoutes] of Object.entries(byFile)) {

        section += `## ${file}\n\n`;

        for (const route of fileRoutes) {

            const mwLine =
                route.middlewares.length > 0
                    ? `  Middlewares: ${route.middlewares.join(", ")}\n`
                    : "";

            section +=
                `${route.method.padEnd(7)} ${route.path}\n` +
                mwLine +
                `  Controller: ${route.controller}\n\n`;

        }

    }

    section += `--------------------------------\n\n`;

    return section;

}

function groupFiles(
    files
) {

    const groups = {};

    for (const file of files) {

        if (!groups[file.category]) {

            groups[file.category] = [];

        }

        groups[file.category].push(
            file
        );

    }

    return groups;

}

function buildCategory(
    category,
    files
) {

    let section =
        `# ${capitalize(category)}\n\n`;

    for (const file of files) {

        section +=
            `## ${file.path}

\`\`\`${getLanguage(file.extension)}
${file.content}
\`\`\`

`;

    }

    section +=
        `\n--------------------------------\n\n`;

    return section;

}

function capitalize(
    text
) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}

function getLanguage(
    extension
) {

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