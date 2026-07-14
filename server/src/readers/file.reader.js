import fs from "fs";
import path from "path";

import {
    MAX_CHARACTERS,
    MAX_LINES,
} from "./ignore.rules.js";

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

    let content =
        fs.readFileSync(
            absolutePath,
            "utf8"
        );

    let truncated = false;

    const lines =
        content.split("\n");

    if (lines.length > MAX_LINES) {

        content =
            lines
                .slice(0, MAX_LINES)
                .join("\n");
        truncated = true;

    }

    if (
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
            relativePath.split(path.sep)[0],

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