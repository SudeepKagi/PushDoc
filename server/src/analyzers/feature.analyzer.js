const DEPENDENCY_FEATURES = {

    // Backend

    express: "REST API",

    mongoose: "MongoDB Database",

    mongodb: "MongoDB Database",

    mysql2: "MySQL Database",

    pg: "PostgreSQL Database",

    // Authentication

    passport: "Authentication",

    jsonwebtoken: "JWT Authentication",

    bcrypt: "Password Hashing",

    "express-session": "Session Management",

    // Storage

    cloudinary: "Cloudinary Image Upload",

    multer: "File Upload",

    "aws-sdk": "AWS S3 Storage",

    // Validation

    joi: "Data Validation",

    zod: "Schema Validation",

    // Realtime

    "socket.io": "Realtime Communication",

    // Email

    nodemailer: "Email Service",

    resend: "Email Service",

    // Payments

    razorpay: "Payment Integration",

    stripe: "Payment Integration",

};

const FILE_PATTERNS = [

    {

        match: "passport.authenticate",

        feature: "Authentication",

    },

    {

        match: "cloudinary",

        feature: "Cloudinary Image Upload",

    },

    {

        match: "multer",

        feature: "File Upload",

    },

    {

        match: "mongoose.model",

        feature: "MongoDB Models",

    },

    {

        match: "express-session",

        feature: "Session Management",

    },

    {

        match: "router.",

        feature: "REST API",

    },

];

export const analyzeFeatures = (
    repository
) => {

    const features =
        new Set();

    extractDependencyFeatures(
        repository,
        features
    );

    extractFileFeatures(
        repository,
        features
    );

    return Array.from(
        features
    ).sort();

};

function extractDependencyFeatures(
    repository,
    features
) {

    const packageFile =
        repository.files.find(
            file =>
                file.path === "package.json"
        );

    if (!packageFile) {

        return;

    }

    const packageJson =
        JSON.parse(
            packageFile.content
        );

    const dependencies = {

        ...(packageJson.dependencies || {}),

        ...(packageJson.devDependencies || {}),

    };

    for (const dependency of Object.keys(
        dependencies
    )) {

        if (
            DEPENDENCY_FEATURES[
            dependency
            ]
        ) {

            features.add(

                DEPENDENCY_FEATURES[
                dependency
                ]

            );

        }

    }

}

function extractFileFeatures(
    repository,
    features
) {

    for (const file of repository.files) {

        const content =
            file.content.toLowerCase();

        for (const pattern of FILE_PATTERNS) {

            if (

                content.includes(

                    pattern.match.toLowerCase()

                )

            ) {

                features.add(
                    pattern.feature
                );

            }

        }

    }

}