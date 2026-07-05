import path from "path";

import * as directoryReader from "./directory.reader.js";
import * as fileReader from "./file.reader.js";

export const readRepository = (
    repositoryPath
) => {

    const filePaths =
        directoryReader.readDirectory(
            repositoryPath
        );

    const files =
        filePaths.map(file =>
            fileReader.readFile(
                repositoryPath,
                file
            )
        );

    return {

        metadata: {

            name:
                path.basename(
                    repositoryPath
                ),

            rootPath:
                repositoryPath,

            totalFiles:
                files.length,

            scannedAt:
                new Date().toISOString(),

        },

        files,

    };

};