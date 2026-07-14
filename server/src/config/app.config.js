import dotenv from "dotenv";
import path from "path";
import os from "os";

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    redis: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
    github: {
        appId: process.env.GITHUB_APP_ID,
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI,
        webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
        appName: process.env.GITHUB_APP_NAME,
    },
    ai: {
        geminiKeys: [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
        ].filter(Boolean),
        groqKeys: [
            process.env.GROQ_API_KEY_1,
            process.env.GROQ_API_KEY_2,
        ].filter(Boolean),
        geminiModel: "gemini-2.5-flash",
        groqModel: "llama-3.3-70b-versatile",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:1234",
    },
    workspace: {
        // In production: set WORKSPACE_ROOT_PATH to an absolute path outside the app
        // e.g. /var/pushdoc/workspaces or a mounted volume
        // Falls back to OS temp dir in production, local temp/ in development
        root: process.env.WORKSPACE_ROOT_PATH ||
            (process.env.NODE_ENV === "production"
                ? path.join(os.tmpdir(), "pushdoc-workspaces")
                : path.join("temp", "workspaces")),
    },
    queue: {
        name: "readme-generation",
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    },
};

export const validateConfig = () => {
    const requiredEnv = {
        "MONGODB_URI": config.mongodb.uri,
        "GITHUB_APP_ID": config.github.appId,
        "GITHUB_CLIENT_ID": config.github.clientId,
        "GITHUB_CLIENT_SECRET": config.github.clientSecret,
        "GITHUB_REDIRECT_URI": config.github.redirectUri,
        "GITHUB_WEBHOOK_SECRET": config.github.webhookSecret,
        "GITHUB_APP_NAME": config.github.appName,
    };

    const missing = [];
    for (const [key, val] of Object.entries(requiredEnv)) {
        if (!val) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `[ConfigError] Missing required environment variables: ${missing.join(", ")}. Please configure them in your .env file.`
        );
    }

    if (config.ai.geminiKeys.length === 0 && config.ai.groqKeys.length === 0) {
        throw new Error(
            `[ConfigError] No AI API keys loaded. Please provide at least one key for Gemini or Groq.`
        );
    }
};
