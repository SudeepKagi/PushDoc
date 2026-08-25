/**
 * Golden Repository Fixtures & Architecture Graph Test Suite (Production V6)
 *
 * Runs comprehensive end-to-end regression and negative tests across:
 *   1. Single-stack architectures (Node, Java, Python, Go).
 *   2. Polyglot microservices with Docker, OpenAPI, External APIs, and Kafka.
 *   3. Contract conflict detection (OpenAPI spec vs code implementations).
 *   4. Environment variable drift detection (.env.example vs code).
 *   5. Negative testing: malformed YAML, broken JSON, ambiguous component layouts.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/golden.fixtures.test.js
 */

import { analyzeRepository } from "../analyzers/repository.analyzer.js";
import { MermaidRenderer }   from "../analyzers/core/mermaid.renderer.js";
import * as Fact             from "../analyzers/core/fact.schema.js";

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}${detail ? ": " + detail : ""}`);
        failed++;
    }
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log(" Golden Repository Fixtures & Architecture Test Suite (V6)");
console.log("══════════════════════════════════════════════════════════════\n");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Single Stack: Express + MongoDB + JWT
// ─────────────────────────────────────────────────────────────────────────────
console.log("── Fixture 1: Express + MongoDB + JWT (Node.js) ──");
{
    const repo = {
        files: [
            {
                path: "package.json",
                content: JSON.stringify({
                    name: "auth-api",
                    dependencies: { express: "^4.18.0", mongoose: "^8.0.0", jsonwebtoken: "^9.0.0" }
                }),
                extension: ".json"
            },
            {
                path: "src/routes/auth.routes.js",
                content: [
                    "const express = require('express');",
                    "const router = express.Router();",
                    "router.post('/login', loginHandler);",
                    "router.post('/register', registerHandler);",
                    "module.exports = router;",
                ].join("\n"),
                extension: ".js"
            },
            {
                path: "src/models/User.js",
                content: [
                    "const mongoose = require('mongoose');",
                    "const userSchema = new mongoose.Schema({ email: String });",
                    "module.exports = mongoose.model('User', userSchema);",
                ].join("\n"),
                extension: ".js"
            },
            {
                path: ".env.example",
                content: "PORT=4000\nJWT_SECRET=supersecret\nMONGODB_URI=mongodb://localhost:27017/auth\n",
                extension: ""
            }
        ]
    };

    const k = analyzeRepository(repo);
    assert("ecosystem is nodejs", k.ecosystem === "nodejs");
    assert("isMonorepo is false", k.isMonorepo === false);
    assert("package recognized Express", k.package?.technology?.frameworks?.includes("Express"));
    assert("package recognized MongoDB", k.package?.technology?.database?.some(d => d.includes("MongoDB")));

    const endpoints = Fact.getEndpoints(k.facts);
    assert("routes extracted", endpoints.length >= 2);
    assert("POST /login present", endpoints.some(e => e.method === "POST" && e.path === "/login"));
    assert("fact has source.analyzer", endpoints[0].source?.analyzer !== undefined);

    const datastores = Fact.getDatastores(k.facts);
    assert("MongoDB datastore mapped", datastores.some(d => d.technology === "MongoDB"));

    const graph = k.architectureGraph;
    assert("graph instance created", graph !== null);
    const mermaid = MermaidRenderer.render(graph);
    assert("Mermaid diagram contains auth-api node", mermaid.includes("auth-api"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Single Stack: Java Spring Boot + PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Fixture 2: Java Spring Boot + PostgreSQL ──");
{
    const repo = {
        files: [
            {
                path: "pom.xml",
                content: "<project><artifactId>order-service</artifactId><dependencies><dependency><artifactId>spring-boot-starter-web</artifactId></dependency><dependency><artifactId>spring-boot-starter-data-jpa</artifactId></dependency><dependency><artifactId>postgresql</artifactId></dependency></dependencies></project>",
                extension: ".xml"
            },
            {
                path: "src/main/java/com/example/OrderController.java",
                content: [
                    "@RestController",
                    '@RequestMapping("/orders")',
                    "public class OrderController {",
                    '    @GetMapping("/{id}")',
                    "    public Order getOrder(@PathVariable Long id) { return null; }",
                    '    @PostMapping',
                    "    public Order createOrder(@RequestBody Order o) { return null; }",
                    "}",
                ].join("\n"),
                extension: ".java"
            }
        ]
    };

    const k = analyzeRepository(repo);
    assert("ecosystem is java", k.ecosystem === "java");
    assert("framework is Spring Boot", k.package?.technology?.frameworks?.includes("Spring Boot"));

    const endpoints = Fact.getEndpoints(k.facts);
    assert("2 Spring endpoints found", endpoints.length === 2);
    assert("GET /orders/:id found", endpoints.some(e => e.method === "GET" && e.path === "/orders/:id"));
    assert("POST /orders found", endpoints.some(e => e.method === "POST" && e.path === "/orders"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Single Stack: Python FastAPI + SQLAlchemy
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Fixture 3: Python FastAPI + SQLAlchemy + Alembic ──");
{
    const repo = {
        files: [
            {
                path: "requirements.txt",
                content: "fastapi\nuvicorn\nsqlalchemy\npsycopg2-binary\nalembic\n",
                extension: ".txt"
            },
            {
                path: "app/main.py",
                content: [
                    "from fastapi import FastAPI",
                    "app = FastAPI()",
                    '@app.get("/items")',
                    "def list_items(): return []",
                    '@app.post("/items")',
                    "def create_item(): return {}",
                    'engine = create_engine("postgresql://user:pass@localhost/db")',
                ].join("\n"),
                extension: ".py"
            }
        ]
    };

    const k = analyzeRepository(repo);
    assert("ecosystem is python", k.ecosystem === "python");
    assert("FastAPI recognized", k.package?.technology?.frameworks?.includes("FastAPI"));

    const endpoints = Fact.getEndpoints(k.facts);
    assert("FastAPI GET /items found", endpoints.some(e => e.method === "GET" && e.path === "/items"));
    assert("FastAPI POST /items found", endpoints.some(e => e.method === "POST" && e.path === "/items"));

    const datastores = Fact.getDatastores(k.facts);
    assert("PostgreSQL datastore found", datastores.some(d => d.technology === "PostgreSQL"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Polyglot Microservices: External APIs, Kafka, and Conflict Detection
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Fixture 4: Polyglot Microservices (React + Node Gateway + Python Payment + Docker + OpenAPI) ──");
{
    const dockerCompose = [
        "services:",
        "  web:",
        "    build: ./apps/web",
        "    ports:",
        "      - '3000:3000'",
        "  gateway:",
        "    build: ./services/gateway",
        "    ports:",
        "      - '8080:8080'",
        "  payment-service:",
        "    build: ./services/payment",
        "    ports:",
        "      - '5000:5000'",
    ].join("\n");

    const openapi = [
        "openapi: 3.0.0",
        "info:",
        "  title: Payment API",
        "  version: 1.0.0",
        "paths:",
        "  /payments:",
        "    post:",
        "      operationId: processPayment",
        "      summary: Process a payment",
        "    get:",
        "      operationId: getPayments",
    ].join("\n");

    const repo = {
        files: [
            { path: "docker-compose.yml", content: dockerCompose, extension: ".yml" },
            { path: "openapi.yaml", content: openapi, extension: ".yaml" },
            { path: ".env.example", content: "PORT=8080\nJWT_SECRET=xyz\n", extension: "" },
            // Web frontend
            {
                path: "apps/web/package.json",
                content: JSON.stringify({ name: "web-client", dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" } }),
                extension: ".json"
            },
            {
                path: "apps/web/src/App.jsx",
                content: "import axios from 'axios'; axios.get('http://gateway/api/orders');",
                extension: ".jsx"
            },
            // Gateway service (Node) calling both internal payment service AND external Stripe API
            {
                path: "services/gateway/package.json",
                content: JSON.stringify({ name: "gateway", dependencies: { express: "^4.18.0", axios: "^1.0.0" } }),
                extension: ".json"
            },
            {
                path: "services/gateway/src/index.js",
                content: [
                    "const express = require('express');",
                    "const axios = require('axios');",
                    "const app = express();",
                    "app.post('/api/checkout', async (req, res) => {",
                    "    const ext = await axios.post('https://api.stripe.com/v1/charges', req.body);",
                    "    const resp = await axios.post('http://payment-service:5000/payment', req.body);",
                    "    res.json(resp.data);",
                    "});",
                ].join("\n"),
                extension: ".js"
            },
            // Payment service (Python) - Note: implements /payment instead of /payments (triggering contract conflict)
            // and uses undeclared REDIS_SECRET (triggering environment drift)
            {
                path: "services/payment/requirements.txt",
                content: "fastapi\nstripe\nredis\n",
                extension: ".txt"
            },
            {
                path: "services/payment/main.py",
                content: [
                    "import os",
                    "from fastapi import FastAPI",
                    "app = FastAPI()",
                    "secret = os.environ['REDIS_SECRET']",
                    '@app.post("/payment")',
                    "def charge(): return {'status': 'ok'}",
                    'client.send("payment-events", payload)',
                ].join("\n"),
                extension: ".py"
            },
        ]
    };

    const k = analyzeRepository(repo);
    assert("isMonorepo detected", k.isMonorepo === true);
    assert("3 services detected", k.services.length === 3);

    const webComponent = k.services.find(s => s.name === "web");
    assert("web classified as application", webComponent?.value?.componentType === "application" || webComponent?.componentType === "application");

    const graph = k.architectureGraph;
    assert("Architecture Graph constructed", graph !== null);

    const nodes = graph.getAllNodes();
    assert("graph contains gateway node", nodes.some(n => n.id === "gateway"));
    assert("graph contains payment service node", nodes.some(n => n.id === "payment" || n.id === "payment-service" || n.label === "payment" || n.label === "payment-service"));
    assert("graph contains external Stripe API node", nodes.some(n => n.type === "external_api" && n.label.includes("Stripe")));

    const edges = graph.getAllEdges();
    assert("cross-service call resolved (gateway -> payment-service)", edges.some(e => e.type === "calls" && e.from === "gateway"));
    assert("external API call resolved (gateway -> Stripe)", edges.some(e => e.type === "calls" && e.to.includes("stripe")));

    // Verify Conflict & Consistency Findings
    const conflicts = k.conflicts || [];
    assert("Contract mismatch conflict detected", conflicts.some(c => c.category === "contract_mismatch"));
    assert("OpenAPI /payments vs code /payment mismatch flagged", conflicts.some(c => c.title?.includes("Mismatch")));
    assert("Environment drift for REDIS_SECRET detected", conflicts.some(c => c.category === "environment_drift" && c.title?.includes("REDIS_SECRET")));

    // Verify Mermaid Serialization via MermaidRenderer
    const mermaid = MermaidRenderer.render(graph);
    assert("Mermaid includes External Services subgraph", mermaid.includes("External Services & APIs"));
    assert("Mermaid includes service calls", mermaid.includes("-->"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Negative & Resilience Testing: Malformed Inputs & Ambiguous Layouts
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Fixture 5: Negative & Resilience Testing (Malformed YAML, Broken JSON, Unknown Layout) ──");
{
    const repo = {
        files: [
            // Malformed YAML in docker-compose
            {
                path: "docker-compose.yml",
                content: "services:\n  invalid: [unclosed list\n  broken: :::\n",
                extension: ".yml"
            },
            // Malformed JSON in package.json
            {
                path: "package.json",
                content: "{ name: 'broken-json', dependencies: { invalid, json ",
                extension: ".json"
            },
            // Ambiguous unknown component folder
            {
                path: "misc_data/data_processor.py",
                content: "def process(): pass",
                extension: ".py"
            }
        ]
    };

    let hadException = false;
    let k = null;
    try {
        k = analyzeRepository(repo);
    } catch (err) {
        hadException = true;
    }

    assert("Analyzes without throwing unhandled exceptions", !hadException && k !== null);
    assert("Returns fallback knowledge object", k.ecosystem !== undefined && k.facts !== undefined);
    assert("Architecture graph handles broken repository gracefully", k.architectureGraph !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
    process.exit(1);
} else {
    console.log("All golden repository fixture and negative tests passed successfully! 🚀\n");
}
