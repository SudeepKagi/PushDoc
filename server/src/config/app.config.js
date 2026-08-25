import dotenv from "dotenv";
import path from "path";
import os from "os";
import fs from "fs";

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
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
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
        ].filter(Boolean),
        groqKeys: [
            process.env.GROQ_API_KEY,
            process.env.GROQ_API_KEY_1,
            process.env.GROQ_API_KEY_2,
        ].filter(Boolean),
        geminiModel: "gemini-2.5-flash",
        groqModel: "llama-3.3-70b-versatile",
    },
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
            : [
                "https://pushdoc-client.onrender.com",
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:1234",
            ],
    },
    frontend: {
        url: process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://pushdoc-client.onrender.com" : "http://localhost:5173"),
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
    cache: {
        // How long to cache an embedding vector keyed by content SHA (7 days).
        // Embeddings are expensive (Gemini API calls); 7 days is safe because
        // the key encodes the exact content — any file change produces a new key.
        embeddingTtlSeconds: 7 * 24 * 60 * 60,
    },
    circuitBreaker: {
        // opossum circuit breaker settings applied per AI provider.
        // timeout: abort a single generate() call if it takes longer than this (ms).
        timeout: 30_000,
        // Open the breaker after this % of calls in the rolling window fail.
        errorThresholdPercentage: 50,
        // After this many ms in the open state, try one request (half-open) to test recovery.
        resetTimeout: 60_000,
    },
    tokenBudget: {
        // Maximum context string length (chars, not tokens) per repo-size tier.
        // Rough approximation: 4 chars per token. Gemini 2.5 Flash context is 1M tokens.
        // We stay well under that to leave room for the prompt and generated output.
        // On overflow, the lowest-ranked RAG chunks are dropped first.
        small:  80_000,   // repos <= 40 files
        medium: 120_000,  // repos 41–150 files
        large:  160_000,  // repos > 150 files
    },
    rag: {
        // Maximum number of files to select for embedding in large repos.
        // Files are ranked by in-degree (dependency centrality) before selection.
        // Raising this increases embedding cost; lowering it may miss key context.
        topNFiles: 15,
        // Number of RAG chunks to retrieve for the generation query.
        topNChunks: 12,
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

    if (!process.env.GITHUB_PRIVATE_KEY && !process.env.GITHUB_PRIVATE_KEY_PATH) {
        // In local development, check if default pem file exists
        const localKeyPath = path.resolve("keys", "pushdoc.2026-06-29.private-key.pem");
        if (!fs.existsSync(localKeyPath)) {
            throw new Error(
                `[ConfigError] Missing GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH. Please configure your GitHub App private key.`
            );
        }
    }

    if (!config.redis.url && !process.env.REDIS_HOST) {
        throw new Error(
            `[ConfigError] Missing REDIS_URL or REDIS_HOST. Please configure Redis connection.`
        );
    }

    if (config.ai.geminiKeys.length === 0 && config.ai.groqKeys.length === 0) {
        throw new Error(
            `[ConfigError] No AI API keys loaded. Please provide at least one key for Gemini or Groq.`
        );
    }
};
