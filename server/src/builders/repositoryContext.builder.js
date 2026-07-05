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

export const buildRepositoryContext = (repository) => {

    let context = "";

    context += buildMetadata(repository);

    const groupedFiles = groupFiles(repository.files);

    for (const category of CATEGORY_ORDER) {

        if (!groupedFiles[category]?.length) {
            continue;
        }

        context += buildCategory(
            category,
            groupedFiles[category]
        );

    }

    return context;

};

function buildMetadata(repository) {

    return `
# Repository

Name: ${repository.metadata.name}

Total Files: ${repository.metadata.totalFiles}

Generated: ${repository.metadata.scannedAt}

--------------------------------

`;

}

function groupFiles(files) {

    const groups = {};

    for (const file of files) {

        if (!groups[file.category]) {
            groups[file.category] = [];
        }

        groups[file.category].push(file);

    }

    return groups;

}

function buildCategory(
    category,
    files
) {

    let section =
        `# ${capitalize(category)}

`;

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

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);

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
        ".yml": "yaml",
        ".yaml": "yaml",

    };

    return map[extension] || "";

}