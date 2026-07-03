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

    stripe: {
        category: "payments",
        value: "Stripe",
    },

    resend: {
        category: "email",
        value: "Resend",
    },

    bullmq: {
        category: "backgroundJobs",
        value: true,
    },

    redis: {
        category: "cache",
        value: "Redis",
    },

};

export const detectCapabilities = (
    dependencies = {}
) => {

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