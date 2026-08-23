/**
 * Critic Unit Tests
 *
 * Tests post-generation detection of hallucinated env vars, packages, and routes.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { critique } from "../analyzers/critic.js";

describe("Critic Hallucination Scanner", () => {
    test("handles null or empty input safely", () => {
        assert.deepEqual(critique(null, null), { violations: [], isClean: true });
        assert.deepEqual(critique("", {}), { violations: [], isClean: true });
    });

    test("passes clean markdown with known identifiers", () => {
        const facts = {
            dependencies: ["express", "mongoose", "bullmq"],
            devDependencies: ["nodemon"],
            routes: [{ method: "GET", path: "/api/health" }],
            envVars: ["PORT", "MONGODB_URI", "REDIS_HOST"],
            envFileVars: ["PORT", "MONGODB_URI", "REDIS_HOST"],
        };

        const cleanReadme = `
# My App
Running on \`express\` with \`mongoose\`.
Configured with PORT and MONGODB_URI.
Check endpoint: /api/health
`;
        const report = critique(cleanReadme, facts);
        assert.equal(report.isClean, true);
        assert.equal(report.violations.length, 0);
    });

    test("flags hallucinated env variables", () => {
        const facts = {
            dependencies: ["express"],
            devDependencies: [],
            routes: [],
            envVars: ["PORT", "DATABASE_URL"],
            envFileVars: ["PORT", "DATABASE_URL"],
        };

        const hallucinatedReadme = `
Please set your STRIPE_SECRET_KEY and AWS_ACCESS_KEY_ID in the .env file.
`;
        const report = critique(hallucinatedReadme, facts);
        assert.equal(report.isClean, false);
        const envViolations = report.violations.filter(v => v.type === "envVar").map(v => v.value);
        assert.ok(envViolations.includes("STRIPE_SECRET_KEY"));
        assert.ok(envViolations.includes("AWS_ACCESS_KEY_ID"));
    });

    test("flags unconfirmed packages in code spans", () => {
        const facts = {
            dependencies: ["express"],
            devDependencies: [],
            routes: [],
            envVars: [],
            envFileVars: [],
        };

        const hallucinatedReadme = `
This project uses \`redis\` and \`stripe\` for background caching and billing.
`;
        const report = critique(hallucinatedReadme, facts);
        assert.equal(report.isClean, false);
        const pkgViolations = report.violations.filter(v => v.type === "package").map(v => v.value);
        assert.ok(pkgViolations.includes("redis"));
        assert.ok(pkgViolations.includes("stripe"));
    });

    test("flags unconfirmed API route paths", () => {
        const facts = {
            dependencies: [],
            devDependencies: [],
            routes: [{ method: "GET", path: "/api/users" }],
            envVars: [],
            envFileVars: [],
        };

        const hallucinatedReadme = `
Send requests to /api/checkout and /auth/login for authentication.
`;
        const report = critique(hallucinatedReadme, facts);
        assert.equal(report.isClean, false);
        const routeViolations = report.violations.filter(v => v.type === "route").map(v => v.value);
        assert.ok(routeViolations.includes("/api/checkout"));
        assert.ok(routeViolations.includes("/auth/login"));
    });
});
