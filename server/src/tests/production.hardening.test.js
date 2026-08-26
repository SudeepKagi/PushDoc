import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../app.js";
import { config, validateConfig } from "../config/app.config.js";
import redisConnection from "../queue/connection.js";
import readmeQueue from "../queue/queue.js";

after(async () => {
    // Importing the production Express app also constructs its queue clients.
    // Await Queue.close() so its Redis handles cannot keep the CI test worker alive.
    await readmeQueue.close();
    redisConnection.disconnect();
});

describe("Production Hardening Test Suite", () => {
    test("Helmet injects standard security headers", async () => {
        const server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const address = server.address();
        const port = address.port;

        try {
            const res = await fetch(`http://127.0.0.1:${port}/health`);
            assert.equal(res.headers.get("x-content-type-options"), "nosniff");
            assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
            assert.ok(res.headers.get("content-security-policy"));
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test("validateConfig detects missing or insecure JWT_SECRET", () => {
        const originalConfig = {
            env: config.env,
            mongodbUri: config.mongodb.uri,
            github: { ...config.github },
            jwtSecret: config.jwt.secret,
        };

        try {
            // This test must not depend on a developer's local .env file.
            config.mongodb.uri = "mongodb://localhost:27017/pushdoc-test";
            Object.assign(config.github, {
                appId: "test-app-id",
                clientId: "test-client-id",
                clientSecret: "test-client-secret",
                redirectUri: "http://localhost:3000/auth/github/callback",
                webhookSecret: "test-webhook-secret",
                appName: "pushdoc-test",
            });

            config.jwt.secret = "";
            assert.throws(() => validateConfig(), /Missing required environment variables: JWT_SECRET/);

            config.jwt.secret = "change-me-to-a-long-random-string";
            config.env = "production";
            assert.throws(() => validateConfig(), /JWT_SECRET is set to an insecure default/);
        } finally {
            config.env = originalConfig.env;
            config.mongodb.uri = originalConfig.mongodbUri;
            Object.assign(config.github, originalConfig.github);
            config.jwt.secret = originalConfig.jwtSecret;
        }
    });

    test("Centralized error middleware sanitizes internal 500 errors", async () => {
        const server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const address = server.address();
        const port = address.port;

        try {
            const res = await fetch(`http://127.0.0.1:${port}/api/non-existent-route`);
            const text = await res.text();
            assert.ok(!text.includes("node_modules"));
            assert.ok(!text.includes("    at "));
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });
});
