import fs from "fs";
import path from "path";

const getFiles = (
    repositoryPath,
    directory
) => {

    const directoryPath = path.join(
        repositoryPath,
        directory
    );

    if (!fs.existsSync(directoryPath)) {
        return [];
    }

    return fs
        .readdirSync(directoryPath)
        .filter((file) => {

            const filePath = path.join(
                directoryPath,
                file
            );

            return fs.statSync(filePath).isFile();

        });

};

export const detectFileStructure = (
    repositoryPath
) => {

    return {

        controllers: getFiles(
            repositoryPath,
            "controllers"
        ),

        models: getFiles(
            repositoryPath,
            "models"
        ),

        routes: getFiles(
            repositoryPath,
            "routes"
        ),

    };

};