/**
 * Diagram Service & Graph Analyzer Unit Tests
 *
 * Tests:
 * 1. Edge extraction and node capping (max 12–15 nodes)
 * 2. Deterministic Mermaid syntax generation
 * 3. Special character and label sanitization
 * 4. Structural Mermaid diagram validation
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { extractDiagramEdges, formatNodeLabel } from "../analyzers/diagram.graph.js";
import { generateMermaid, sanitizeNodeLabels, validateDiagram, generateArchitectureSection } from "../services/diagram.service.js";

const makeFile = (path, content) => ({ path, content, extension: ".js" });

describe("Diagram Graph Analyzer", () => {
    test("formats node labels cleanly", () => {
        assert.equal(formatNodeLabel("src/controllers/auth.controller.js"), "auth.controller");
        assert.equal(formatNodeLabel("server.js"), "server");
        assert.equal(formatNodeLabel("services/user.service.ts"), "user.service");
    });

    test("extracts edges from relative imports", () => {
        const files = [
            makeFile("src/controllers/auth.controller.js", `import { userService } from "../services/user.service.js";`),
            makeFile("src/services/user.service.js", `import { User } from "../models/user.model.js";`),
            makeFile("src/models/user.model.js", `export const User = {};`),
        ];

        const graph = extractDiagramEdges(files, 12);
        assert.equal(graph.edges.length, 2);
        assert.ok(graph.edges.some(e => e.from === "auth.controller" && e.to === "user.service"));
        assert.ok(graph.edges.some(e => e.from === "user.service" && e.to === "user.model"));
    });

    test("enforces maximum node count cap", () => {
        const files = [];
        for (let i = 0; i < 20; i++) {
            const nextIdx = (i + 1) % 20;
            files.push(
                makeFile(`src/module${i}.js`, `import m from "./module${nextIdx}.js";`)
            );
        }

        const maxNodes = 8;
        const graph = extractDiagramEdges(files, maxNodes);
        assert.ok(graph.nodes.length <= maxNodes, `Expected <= ${maxNodes} nodes, got ${graph.nodes.length}`);
    });
});

describe("Diagram Service", () => {
    test("generates valid Mermaid flowchart syntax", () => {
        const graphData = {
            nodes: ["auth.controller", "user.service"],
            edges: [{ from: "auth.controller", to: "user.service" }],
        };

        const mermaid = generateMermaid(graphData);
        assert.ok(mermaid.startsWith("flowchart TD"));
        assert.ok(mermaid.includes('auth_controller["auth.controller"] --> user_service["user.service"]'));

        const validation = validateDiagram(mermaid);
        assert.equal(validation.isValid, true);
    });

    test("sanitizes node labels with dangerous characters", () => {
        const raw = 'flowchart TD\n    a["auth(controller)"] --> b["db;[pool]"]';
        const sanitized = sanitizeNodeLabels(raw);
        assert.ok(sanitized.includes('["auth(controller)"]'));
        const validation = validateDiagram(sanitized);
        assert.equal(validation.isValid, true);
    });

    test("validator rejects malformed or headerless diagrams", () => {
        assert.equal(validateDiagram("").isValid, false);
        assert.equal(validateDiagram("just some text").isValid, false);
        assert.equal(validateDiagram("flowchart TD\n    a[open bracket --> b").isValid, false);
        assert.equal(validateDiagram("flowchart TD\n    a no arrows b").isValid, false);
    });

    test("generateArchitectureSection returns formatted markdown block", () => {
        const files = [
            makeFile("src/app.js", `import "./routes/index.js";`),
            makeFile("src/routes/index.js", `import "./controllers/api.js";`),
            makeFile("src/controllers/api.js", `export const api = {};`),
        ];

        const section = generateArchitectureSection(files);
        assert.ok(section.includes("## 🏛️ System Architecture"));
        assert.ok(section.includes("```mermaid"));
        assert.ok(section.includes("flowchart TD"));
    });

    test("generateArchitectureSection returns empty string when no edges exist", () => {
        const files = [
            makeFile("src/a.js", "const a = 1;"),
            makeFile("src/b.js", "const b = 2;"),
        ];

        const section = generateArchitectureSection(files);
        assert.equal(section, "");
    });
});
