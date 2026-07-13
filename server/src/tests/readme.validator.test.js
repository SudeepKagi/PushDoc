/**
 * README Validator V1 — Test Suite
 *
 * Standalone Node test file.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/readme.validator.test.js
 *
 * Non-zero exit code means failure.
 */

import { validateReadme } from "../validators/readme.validator.js";

let passed = 0;
let failed = 0;

function test(label, fn) {
    try {
        fn();
        console.log(`  ✅  ${label}`);
        passed++;
    } catch (err) {
        console.error(`  ❌  ${label}`);
        console.error(`       ${err.message}`);
        failed++;
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(
                    `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
                );
            }
        },
        toEqual(expected) {
            const a = JSON.stringify(actual);
            const b = JSON.stringify(expected);
            if (a !== b) throw new Error(`Expected\n  ${b}\ngot\n  ${a}`);
        },
        toHaveLength(n) {
            if ((actual || []).length !== n) {
                throw new Error(
                    `Expected length ${n}, got ${(actual || []).length}.\nGot: ${JSON.stringify(actual)}`
                );
            }
        },
        toContain(value) {
            if (!actual.includes(value)) {
                throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(value)}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected value to be truthy, got ${JSON.stringify(actual)}`);
            }
        },
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected value to be falsy, got ${JSON.stringify(actual)}`);
            }
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Data & Mock Knowledge
// ─────────────────────────────────────────────────────────────────────────────

const mockKnowledge = {
    package: {
        project: { name: "pushdoc-server" },
    },
    features: {
        features: [
            { title: "Authentication", description: "Users can register, login and logout." },
            { title: "Image Upload", description: "Listings support image uploads using Cloudinary." }
        ]
    },
    models: [
        { name: "Listing" },
        { name: "Review" }
    ],
    routes: [
        { path: "/listings" },
        { path: "/reviews" }
    ]
};

// A fully compliant README matching the mock knowledge (over 150 words)
const VALID_README = `
# PushDoc Server

## Description
This is a production-grade backend server application designed to run background README generation tasks for GitHub repositories. It integrates webhook handlers, Redis queues, and AI generation services to provide seamless documentation automation.

## Features
- **Authentication**: Users can register, login and logout securely to manage their repository configurations.
- **Image Upload**: Listings support image uploads using Cloudinary cloud storage services.

## Tech Stack
This application is built using the following modern tech stack:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Mongoose / MongoDB
- **Uploads**: Cloudinary

## Installation
To install the dependencies and set up the server environment locally, run the following npm install command in your terminal:
\`\`\`bash
npm install
\`\`\`

## Usage
To start the development server with hot-reloading enabled, run the following start script in your terminal:
\`\`\`bash
npm start
\`\`\`

## API Overview
This documents the api endpoints including the following routes:
- GET /listings: Retrieves a list of listings
- POST /reviews: Creates a new review for a listing

## Database Models
This application defines database schemas for the following entities:
- **Listing**: Represents a listing with title and price
- **Review**: Represents a user review with rating and comment
`;

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(" README Validator V1 — Test Suite");
console.log("══════════════════════════════════════════\n");

console.log("── Compliant README ──");

test("passes a fully compliant and complete README", () => {
    const result = validateReadme(VALID_README, mockKnowledge);
    expect(result.valid).toBeTruthy();
    expect(result.score).toBe(100);
    expect(result.missingSections).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
});

console.log("\n── Syntax Validation ──");

test("detects unbalanced code fences and subtracts score", () => {
    const badReadme = VALID_README + "\n```javascript\nconst a = 1;\n"; // unclosed block
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.valid).toBeFalsy(); // Score should drop below 90
    expect(result.warnings.some(w => w.includes("Unbalanced code blocks"))).toBeTruthy();
});

test("detects skipped heading level hierarchy", () => {
    const badReadme = `
# PushDoc Server
### Skipped Description
This skipped H2 and went directly to H3.
    ` + VALID_README;
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.warnings.some(w => w.includes("Heading level skipped"))).toBeTruthy();
});

test("detects duplicate heading texts", () => {
    const badReadme = VALID_README + "\n## Features\nSome extra duplicate section.";
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.warnings.some(w => w.includes("Duplicate heading detected"))).toBeTruthy();
});

test("detects mismatched table columns", () => {
    const badReadme = VALID_README + `
| Header 1 | Header 2 |
|---|---|
| Col 1 | Col 2 |
| Col 1 | Mismatched Col 2 | Col 3 |
`;
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.warnings.some(w => w.includes("column count"))).toBeTruthy();
});

console.log("\n── Section & Coverage Validation ──");

test("detects missing required sections and subtracts score", () => {
    // Missing "Installation" section
    const badReadme = VALID_README.replace("## Installation", "## Setup");
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.missingSections).toContain("Installation");
    expect(result.score < 100).toBeTruthy();
});

test("detects missing database models and api routes", () => {
    // Use replaceAll to replace both Listings and Listing occurrences so it's completely gone
    const badReadme = VALID_README
        .replaceAll("Listing", "SomethingElse")
        .replaceAll("listing", "somethingelse")
        .replace("/reviews", "/other");

    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.warnings.some(w => w.includes('model "Listing"'))).toBeTruthy();
    expect(result.warnings.some(w => w.includes('path "/reviews"'))).toBeTruthy();
});

test("detects placeholder text and TODOs", () => {
    const badReadme = VALID_README + "\nTODO: Add database connection instructions.";
    const result = validateReadme(badReadme, mockKnowledge);
    expect(result.warnings.some(w => w.includes("placeholder text"))).toBeTruthy();
});

// ─────────────────────────────────────────────────────────────────────────────
// Print full output for visual inspection
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Visual Inspection Output (Failing Case) ──\n");

const failingReadme = `
# Broken Project

This readme has no features, no installation, no database models section.
It also has an open fence:
\`\`\`javascript
const x = 5;

And a placeholder: [Insert description here]
`;

const failingResults = validateReadme(failingReadme, mockKnowledge);
console.log(JSON.stringify(failingResults, null, 2));

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log("══════════════════════════════════════════\n");

if (failed > 0) {
    process.exit(1);
}
