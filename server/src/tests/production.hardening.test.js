import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../app.js";
import { config, validateConfig } from "../config/app.config.js";
import redisConnection from "../queue/connection.js";
import readmeQueue from "../queue/queue.js";

after(() => {
    // Importing the production Express app also constructs its queue clients.
    // Explicitly close them so this HTTP test cannot keep the test worker alive.
    readmeQueue.disconnect();
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
        const originalSecret = config.jwt.secret;
        try {
            config.jwt.secret = "";
            assert.throws(() => validateConfig(), /Missing required environment variables: JWT_SECRET/);

            config.jwt.secret = "change-me-to-a-long-random-string";
            const originalEnv = config.env;
            config.env = "production";
            assert.throws(() => validateConfig(), /JWT_SECRET is set to an insecure default/);
            config.env = originalEnv;
        } finally {
            config.jwt.secret = originalSecret;
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
