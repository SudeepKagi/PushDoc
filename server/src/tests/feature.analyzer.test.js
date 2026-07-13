/**
 * Feature Analyzer V1 — Test Suite
 *
 * WHY A STANDALONE TEST FILE
 * ──────────────────────────
 * Tests the feature analyzer against mocked outputs of all previous analyzers
 * in isolation before we wire it into repository.analyzer.js.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/feature.analyzer.test.js
 *
 * Non-zero exit code means failure.
 */

import { analyzeFeatures } from "../analyzers/feature.analyzer.js";

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
    };
}

// Helper to find a feature by title
function findFeature(features, title) {
    return features.find((f) => f.title === title);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Cases
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(" Feature Analyzer V1 — Test Suite");
console.log("══════════════════════════════════════════\n");

console.log("── Technical Capabilities Inference ──");

test("detects CRUD, Authentication, and Image Upload capabilities from package & controller ops", () => {
    const knowledge = {
        package: {
            dependencies: ["express", "mongoose", "passport", "cloudinary"]
        },
        models: [
            { name: "Listing" },
            { name: "User" }
        ],
        controllers: [
            {
                controller: "controllers/listingController.js",
                exports: [
                    { name: "createListing", operations: ["Create Listing", "Upload Image"], models: ["Listing"], methods: ["save"] }
                ]
            }
        ]
    };

    const result = analyzeFeatures(knowledge);
    expect(result.capabilities).toContain("CRUD");
    expect(result.capabilities).toContain("Authentication");
    expect(result.capabilities).toContain("Image Upload");
});

test("detects Payments, Geolocation, and Email capabilities", () => {
    const knowledge = {
        package: {
            dependencies: ["stripe", "@mapbox/mapbox-sdk", "nodemailer"]
        },
        models: [{ name: "Listing" }],
        controllers: [
            {
                controller: "controllers/paymentController.js",
                exports: [
                    { name: "checkout", operations: ["Process Payment", "Geocode Location", "Send Email"], models: [], methods: [] }
                ]
            }
        ]
    };

    const result = analyzeFeatures(knowledge);
    expect(result.capabilities).toContain("Payments");
    expect(result.capabilities).toContain("Geolocation");
    expect(result.capabilities).toContain("Email");
});

test("detects Caching and Background Jobs capabilities", () => {
    const knowledge = {
        package: {
            dependencies: ["redis", "bullmq"]
        },
        models: [],
        controllers: [
            {
                controller: "controllers/workerController.js",
                exports: [
                    { name: "runJob", operations: ["Cache Data", "Background Jobs"], models: [], methods: [] }
                ]
            }
        ]
    };

    const result = analyzeFeatures(knowledge);
    expect(result.capabilities).toContain("Caching");
    expect(result.capabilities).toContain("Background Jobs");
});

console.log("\n── High-Level Business Features Inference ──");

test("infers Authentication feature from User model or Passport dependency", () => {
    const knowledge = {
        package: { dependencies: ["passport"] },
        models: [{ name: "User" }],
        controllers: []
    };

    const result = analyzeFeatures(knowledge);
    const auth = findFeature(result.features, "Authentication");
    expect(auth).toBeTruthy();
    expect(auth.description).toBe("Users can register, login and logout.");
});

test("infers CRUD model Management vs System vs Generic features", () => {
    const knowledge = {
        package: { dependencies: ["express", "mongoose"] },
        models: [
            { name: "Listing" },
            { name: "Review" },
            { name: "Product" }
        ],
        controllers: [
            {
                controller: "controllers/listingController.js",
                exports: [
                    // Full CRUD operations for Listing
                    { name: "index", operations: ["Find Listings"], models: ["Listing"], methods: ["find"] },
                    { name: "create", operations: ["Create Listing"], models: ["Listing"], methods: ["save"] },
                    { name: "update", operations: ["Update Listing"], models: ["Listing"], methods: ["findByIdAndUpdate"] },
                    { name: "delete", operations: ["Delete Listing"], models: ["Listing"], methods: ["findByIdAndDelete"] }
                ]
            },
            {
                controller: "controllers/reviewController.js",
                exports: [
                    // Partial add/remove operations for Review
                    { name: "create", operations: ["Create Review"], models: ["Review"], methods: ["save"] },
                    { name: "delete", operations: ["Delete Review"], models: ["Review"], methods: ["findByIdAndDelete"] }
                ]
            }
            // Product has no controller exports listed -> should fall back to generic Management
        ]
    };

    const result = analyzeFeatures(knowledge);
    
    // Listing Management
    const listingFeat = findFeature(result.features, "Listing Management");
    expect(listingFeat).toBeTruthy();
    expect(listingFeat.description).toBe("Users can create, edit, delete and browse listings.");

    // Review System
    const reviewFeat = findFeature(result.features, "Review System");
    expect(reviewFeat).toBeTruthy();
    expect(reviewFeat.description).toBe("Users can add and remove reviews.");

    // Product Management (Fallback)
    const productFeat = findFeature(result.features, "Product Management");
    expect(productFeat).toBeTruthy();
    expect(productFeat.description).toBe("Provides database storage and operations for managing products.");
});

test("infers Cloudinary Image Upload feature", () => {
    const knowledge = {
        package: { dependencies: ["cloudinary"] },
        models: [],
        controllers: []
    };
    const result = analyzeFeatures(knowledge);
    const feat = findFeature(result.features, "Image Upload");
    expect(feat).toBeTruthy();
    expect(feat.description).toBe("Listings support image uploads using Cloudinary.");
});

test("infers Mapbox Geolocation feature", () => {
    const knowledge = {
        package: { dependencies: [] },
        models: [],
        controllers: [
            {
                controller: "controllers/listingController.js",
                exports: [
                    { name: "create", operations: ["Geocode Location"], models: [], methods: [] }
                ]
            }
        ]
    };
    const result = analyzeFeatures(knowledge);
    const feat = findFeature(result.features, "Geolocation");
    expect(feat).toBeTruthy();
    expect(feat.description).toBe("Integrates Mapbox for location geocoding and mapping services.");
});

// ─────────────────────────────────────────────────────────────────────────────
// Print full output for visual inspection
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Visual Inspection Output ──\n");

const sampleKnowledge = {
    package: {
        dependencies: ["express", "mongoose", "passport", "cloudinary", "stripe", "nodemailer", "redis"]
    },
    models: [
        { name: "Listing" },
        { name: "Review" },
        { name: "User" }
    ],
    controllers: [
        {
            controller: "controllers/listingController.js",
            exports: [
                { name: "index", operations: ["Find Listings", "Filter Listings"], models: ["Listing"], methods: ["find"] },
                { name: "create", operations: ["Create Listing", "Upload Image", "Geocode Location"], models: ["Listing"], methods: ["save"] },
                { name: "update", operations: ["Update Listing"], models: ["Listing"], methods: ["findByIdAndUpdate"] },
                { name: "delete", operations: ["Delete Listing"], models: ["Listing"], methods: ["findByIdAndDelete"] }
            ]
        },
        {
            controller: "controllers/reviewController.js",
            exports: [
                { name: "create", operations: ["Create Review"], models: ["Review"], methods: ["save"] },
                { name: "delete", operations: ["Delete Review"], models: ["Review"], methods: ["findByIdAndDelete"] }
            ]
        }
    ]
};

const visualResults = analyzeFeatures(sampleKnowledge);
console.log(JSON.stringify(visualResults, null, 2));

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log("══════════════════════════════════════════\n");

if (failed > 0) {
    process.exit(1);
}
