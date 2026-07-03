import fs from "fs";
import path from "path";

export const detectProjectStructure = (
    repositoryPath,
    packageJson
) => {

    const hasControllers = fs.existsSync(
        path.join(repositoryPath, "controllers")
    );

    const hasModels = fs.existsSync(
        path.join(repositoryPath, "models")
    );

    const hasRoutes = fs.existsSync(
        path.join(repositoryPath, "routes")
    );

    const hasClient = fs.existsSync(
        path.join(repositoryPath, "client")
    );

    const hasViews = fs.existsSync(
        path.join(repositoryPath, "views")
    );

    const hasPublic = fs.existsSync(
        path.join(repositoryPath, "public")
    );

    const dependencies =
        packageJson.dependencies || {};

    const usesEJS =
        "ejs" in dependencies;

    let frontend = {
        exists: false,
        type: null,
    };

    let rendering = null;

    if (hasClient) {

        frontend = {
            exists: true,
            type: "SPA",
        };

        rendering = "CSR";

    } else if (
        hasViews &&
        hasPublic &&
        usesEJS
    ) {

        frontend = {
            exists: true,
            type: "Server Rendered",
        };

        rendering = "SSR";

    }

    return {

        architecture:
            hasControllers &&
                hasModels &&
                hasRoutes
                ? "MVC"
                : "Unknown",

        backend: {
            exists:
                hasControllers ||
                hasRoutes,
            framework: "Express",
        },

        frontend,

        rendering,

    };

};