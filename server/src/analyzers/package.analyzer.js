const FRAMEWORKS = {
    express: "Express",
    react: "React",
    next: "Next.js",
    vue: "Vue",
    angular: "Angular",
    fastify: "Fastify",
};

const DATABASES = {
    mongoose: "MongoDB",
    mongodb: "MongoDB",
    mysql2: "MySQL",
    pg: "PostgreSQL",
    sqlite3: "SQLite",
};

const AUTHENTICATION = {
    passport: "Passport",
    jsonwebtoken: "JWT",
    clerk: "Clerk",
    auth0: "Auth0",
    "express-session": "Express Session",
};

const STORAGE = {
    cloudinary: "Cloudinary",
    firebase: "Firebase Storage",
    "aws-sdk": "AWS S3",
};

export const analyzePackage = (repository) => {

    const packageFile = repository.files.find(
        file => file.path === "package.json"
    );

    if (!packageFile) {

        return null;

    }

    let packageJson;

    try {

        packageJson = JSON.parse(
            packageFile.content
        );

    }

    catch {

        return null;

    }

    const dependencies = {

        ...(packageJson.dependencies || {}),

        ...(packageJson.devDependencies || {}),

    };

    return {

        project: {

            name:
                packageJson.name || "",

            version:
                packageJson.version || "",

            description:
                packageJson.description || "",

        },

        technology: {

            language:
                detectLanguage(
                    dependencies
                ),

            framework:
                detectFramework(
                    dependencies
                ),

            database:
                detectDatabase(
                    dependencies
                ),

            authentication:
                detectAuthentication(
                    dependencies
                ),

            storage:
                detectStorage(
                    dependencies
                ),

            packageManager:
                detectPackageManager(),

            runtime:
                detectRuntime(),

        },

        scripts:
            packageJson.scripts || {},

        dependencies:
            Object.keys(
                dependencies
            ),

    };

};

function detectFramework(
    dependencies
) {

    for (const dependency of Object.keys(
        FRAMEWORKS
    )) {

        if (dependencies[dependency]) {

            return FRAMEWORKS[
                dependency
            ];

        }

    }

    return "Unknown";

}

function detectDatabase(
    dependencies
) {

    const databases = [];

    for (const dependency of Object.keys(
        DATABASES
    )) {

        if (dependencies[dependency]) {

            databases.push(
                DATABASES[
                dependency
                ]
            );

        }

    }

    return databases;

}

function detectAuthentication(
    dependencies
) {

    const auth = [];

    for (const dependency of Object.keys(
        AUTHENTICATION
    )) {

        if (dependencies[dependency]) {

            auth.push(
                AUTHENTICATION[
                dependency
                ]
            );

        }

    }

    return auth;

}

function detectStorage(
    dependencies
) {

    const storage = [];

    for (const dependency of Object.keys(
        STORAGE
    )) {

        if (dependencies[dependency]) {

            storage.push(
                STORAGE[
                dependency
                ]
            );

        }

    }

    return storage;

}

function detectLanguage() {

    return "JavaScript";

}

function detectRuntime() {

    return "Node.js";

}

function detectPackageManager() {

    return "npm";

}