import fs from "fs";
import path from "path";

import {
    MAX_CHARACTERS,
    MAX_LINES,
    MAX_FILE_SIZE,
} from "./ignore.rules.js";

const MANIFEST_FILENAMES = new Set([
    "package.json", "requirements.txt", "pyproject.toml", "Pipfile",
    "pom.xml", "build.gradle", "build.gradle.kts", "go.mod", "Cargo.toml", "composer.json",
    "Gemfile", "pubspec.yaml", "mix.exs",
]);

export const readFile = (
    repositoryPath,
    relativePath
) => {

    const absolutePath = path.join(
        repositoryPath,
        relativePath
    );

    const stats =
        fs.statSync(absolutePath);

    const isManifest = MANIFEST_FILENAMES.has(path.basename(relativePath));

    if (!isManifest && stats.size > MAX_FILE_SIZE) {
        return {
            path: relativePath,
            content: `// [File omitted: size (${Math.round(stats.size / 1024)} KB) exceeds MAX_FILE_SIZE limit]`,
            extension: path.extname(relativePath),
            size: stats.size,
            lines: 1,
            truncated: true,
        };
    }

    let content =
        fs.readFileSync(
            absolutePath,
            "utf8"
        );

    let truncated = false;

    const lines =
        content.split("\n");

    if (!isManifest && lines.length > MAX_LINES) {

        content =
            lines
                .slice(0, MAX_LINES)
                .join("\n");
        truncated = true;

    }

    if (
        !isManifest &&
        content.length >
        MAX_CHARACTERS
    ) {

        content =
            content.substring(
                0,
                MAX_CHARACTERS
            );

        truncated = true;

    }

    return {

        path: relativePath,

        category:
            getCategory(relativePath),

        extension:
            path.extname(relativePath),

        language:
            detectLanguage(relativePath),

        size: stats.size,

        lines:
            lines.length,

        truncated,

        content,

    };

};

function getCategory(relativePath) {
    const segments = relativePath.split(/[/\\]/);
    if (segments.length === 0) return "";
    
    const categories = new Set([
        "controllers", "controller",
        "routes", "route",
        "models", "model",
        "middlewares", "middleware",
        "config",
        "services", "service",
        "workers", "worker",
        "pipelines", "pipeline"
    ]);

    for (let i = segments.length - 2; i >= 0; i--) {
        const seg = segments[i].toLowerCase();
        if (categories.has(seg)) {
            return seg;
        }
    }

    if (segments.length > 1) {
        return segments[segments.length - 2];
    }
    return segments[0];
}

function detectLanguage(
    filePath
) {

    const extension =
        path.extname(filePath);

    const map = {

        ".js": "JavaScript",

        ".ts": "TypeScript",

        ".jsx": "React",

        ".tsx": "React",

        ".json": "JSON",

        ".md": "Markdown",

        ".html": "HTML",

        ".css": "CSS",

        ".scss": "SCSS",

        ".yml": "YAML",

        ".yaml": "YAML",

        ".java": "Java",

        ".py": "Python",

    };

    return (
        map[extension] ??
        "Text"
    );

}