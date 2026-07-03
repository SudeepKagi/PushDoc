import fs from "fs";
import path from "path";

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

const detectFramework = (dependencies = {}) => {

    const FRAMEWORKS = {
        express: "Express",
        react: "React",
        next: "Next.js",
        "@nestjs/core": "NestJS",
        vue: "Vue.js",
        angular: "Angular",
        fastify: "Fastify",
        hono: "Hono",
        astro: "Astro",
        remix: "Remix",
        svelte: "Svelte",
    };

    for (const dependency of Object.keys(dependencies)) {

        if (FRAMEWORKS[dependency]) {
            return FRAMEWORKS[dependency];
        }

    }

    return "Unknown";

};

const detectPackageManager = (repositoryPath) => {

    if (
        fs.existsSync(
            path.join(repositoryPath, "pnpm-lock.yaml")
        )
    ) {
        return "pnpm";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "yarn.lock")
        )
    ) {
        return "yarn";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "package-lock.json")
        )
    ) {
        return "npm";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "bun.lockb")
        )
    ) {
        return "bun";
    }

    return "Unknown";

};

const detectLanguage = (repositoryPath) => {

    if (
        fs.existsSync(
            path.join(repositoryPath, "tsconfig.json")
        )
    ) {
        return "TypeScript";
    }

    return "JavaScript";

};

export const analyzeProject = async (
    repositoryPath
) => {

    const packageJson =
        readPackageJson(repositoryPath);

    return {

        basicInfo: getBasicInfo(packageJson),

        technology: {
            framework: detectFramework(
                packageJson.dependencies
            ),
            language: detectLanguage(
                repositoryPath
            ),
            packageManager:
                detectPackageManager(
                    repositoryPath
                ),
        },

        capabilities: detectCapabilities(
            packageJson.dependencies
        ),

        scripts: packageJson.scripts || {},

        dependencies:
            packageJson.dependencies || {},

        devDependencies:
            packageJson.devDependencies || {},
        structure: detectProjectStructure(
            repositoryPath
        ),

    };

};

const CAPABILITY_MAP = {
    mongoose: {
        category: "database",
        value: "MongoDB",
    },

    passport: {
        category: "authentication",
        value: true,
    },

    "passport-local": {
        category: "authenticationStrategy",
        value: "Local",
    },

    "express-session": {
        category: "sessions",
        value: true,
    },

    multer: {
        category: "fileUploads",
        value: true,
    },

    cloudinary: {
        category: "imageHosting",
        value: "Cloudinary",
    },
};

const detectCapabilities = (dependencies = {}) => {

    const capabilities = {};

    for (const dependency of Object.keys(dependencies)) {

        const capability =
            CAPABILITY_MAP[dependency];

        if (capability) {

            capabilities[
                capability.category
            ] = capability.value;

        }

    }

    return capabilities;

};

const detectProjectStructure = (repositoryPath) => {

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

    const hasServer = fs.existsSync(
        path.join(repositoryPath, "server")
    );

    return {

        architecture:
            hasControllers &&
                hasModels &&
                hasRoutes
                ? "MVC"
                : "Unknown",

        backend:
            hasControllers ||
            hasRoutes,

        frontend:
            hasClient,

        fullStack:
            hasClient &&
            hasServer,

    };

};