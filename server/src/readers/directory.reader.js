import fs from "fs";
import path from "path";

import {
    shouldIgnoreDirectory,
    isSupportedExtension,
    isImportantFile,
} from "./ignore.rules.js";

/**
 * Recursively walks a repository and
 * returns every important file path.
 */
export const readDirectory = (
    directoryPath
) => {

    const files = [];

    walk(directoryPath, files);

    return files;

};

function walk(
    currentPath,
    files
) {

    const entries =
        fs.readdirSync(currentPath, {
            withFileTypes: true,
        });

    for (const entry of entries) {

        const fullPath = path.join(
            currentPath,
            entry.name
        );

        if (entry.isDirectory()) {

            if (
                shouldIgnoreDirectory(
                    entry.name
                )
            ) {
                continue;
            }

            walk(
                fullPath,
                files
            );

            continue;

        }

        if (
            isImportantFile(entry.name) ||
            isSupportedExtension(fullPath)
        ) {

            files.push(fullPath);

        }

    }

}