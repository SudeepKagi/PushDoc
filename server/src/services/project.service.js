import fs from "fs";
import path from "path";

import { detectFramework } from "../analyzers/framework.analyzer.js";
import { detectLanguage } from "../analyzers/language.analyzer.js";
import { detectPackageManager } from "../analyzers/packageManager.analyzer.js";
import { detectCapabilities } from "../analyzers/capability.analyzer.js";
import { detectProjectStructure } from "../analyzers/structure.analyzer.js";
import { detectFileStructure } from "../analyzers/fileStructure.analyzer.js";

const readPackageJson = (repositoryPath) => {

    const packageJsonPath = path.join(
        repositoryPath,
        "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error("package.json not found");
    }

    return JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
    );

};

const getBasicInfo = (packageJson) => {

    return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
    };

};

export const analyzeProject = async (
    repositoryPath
) => {

    const packageJson =
        readPackageJson(repositoryPath);

    return {

        basicInfo:
            getBasicInfo(packageJson),

        technology: {

            framework:
                detectFramework(
                    packageJson.dependencies
                ),

            language:
                detectLanguage(
                    repositoryPath
                ),

            packageManager:
                detectPackageManager(
                    repositoryPath
                ),

        },

        capabilities:
            detectCapabilities(
                packageJson.dependencies
            ),

        structure:
            detectProjectStructure(
                repositoryPath,
                packageJson
            ),
        fileStructure:
            detectFileStructure(
                repositoryPath
            ),

        scripts:
            packageJson.scripts || {},

        dependencies:
            packageJson.dependencies || {},

        devDependencies:
            packageJson.devDependencies || {},


    };

};