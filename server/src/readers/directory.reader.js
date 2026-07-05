import fs from "fs";
import path from "path";

import {
    shouldIgnoreDirectory,
    isSupportedExtension,
    isImportantFile,
} from "./ignore.rules.js";

export const readDirectory = (repositoryPath) => {

    const files = [];

    walk(repositoryPath, repositoryPath, files);

    return files;

};

const walk = (
    rootPath,
    currentPath,
    files
) => {

    const entries = fs.readdirSync(currentPath, {
        withFileTypes: true,
    });

    for (const entry of entries) {

        const fullPath = path.join(
            currentPath,
            entry.name
        );

        if (entry.isDirectory()) {

            if (
                shouldIgnoreDirectory(entry.name)
            ) {
                continue;
            }

            walk(
                rootPath,
                fullPath,
                files
            );

            continue;

        }

        if (
            isImportantFile(entry.name) ||
            isSupportedExtension(fullPath)
        ) {

            files.push(
                path.relative(
                    rootPath,
                    fullPath
                )
            );

        }

    }

};