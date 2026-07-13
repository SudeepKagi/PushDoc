import * as packageAnalyzer from "../analyzers/package.analyzer.js";

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

    const packageInfo =
        packageAnalyzer.analyzePackage(
            repository
        );

    if (packageInfo) {

        context += buildProjectSection(
            packageInfo
        );

    }

    context += buildMetadata(
        repository
    );

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