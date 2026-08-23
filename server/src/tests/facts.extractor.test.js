/**
 * Facts Extractor Unit Tests
 *
 * Tests extraction of canonical ground truth facts from repository knowledge objects.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { extractFacts } from "../analyzers/facts.extractor.js";

describe("Facts Extractor", () => {
    test("handles null or empty knowledge gracefully", () => {
        const facts = extractFacts(null);
        assert.deepEqual(facts, {
            projectName: "",
            dependencies: [],
            devDependencies: [],
            scripts: [],
            routes: [],
            envVars: [],
            envFileVars: [],
        });
    });

    test("extracts package, routes, env vars, and scripts correctly", () => {
        const mockKnowledge = {
            package: {
                project: {
                    name: "pushdoc-server",
                    dependencies: {
                        express: "^4.18.2",
                        mongoose: "^7.0.0",
                    },
                    devDependencies: {
                        nodemon: "^3.0.1",
                    },
                    scripts: {
                        dev: "nodemon server.js",
                        start: "node server.js",
                    },
                },
            },
            routes: [
                { method: "POST", path: "/api/webhooks" },
                { method: "GET", path: "/api/health" },
            ],
            ast: {
                envVars: ["PORT", "MONGODB_URI"],
                envFileVars: [
                    { key: "PORT", sourceFile: ".env.example" },
                    { key: "MONGODB_URI", sourceFile: ".env.example" },
                    { key: "GITHUB_APP_ID", sourceFile: ".env.example" },
                ],
            },
        };

        const facts = extractFacts(mockKnowledge);

        assert.equal(facts.projectName, "pushdoc-server");
        assert.deepEqual(facts.dependencies, ["express", "mongoose"]);
        assert.deepEqual(facts.devDependencies, ["nodemon"]);
        assert.deepEqual(facts.scripts, [
            { name: "dev", command: "nodemon server.js" },
            { name: "start", command: "node server.js" },
        ]);
        assert.deepEqual(facts.routes, [
            { method: "POST", path: "/api/webhooks" },
            { method: "GET", path: "/api/health" },
        ]);
        assert.ok(facts.envVars.includes("PORT"));
        assert.ok(facts.envVars.includes("MONGODB_URI"));
        assert.ok(facts.envVars.includes("GITHUB_APP_ID"));
        assert.deepEqual(facts.envFileVars, ["PORT", "MONGODB_URI", "GITHUB_APP_ID"]);
    });
});
