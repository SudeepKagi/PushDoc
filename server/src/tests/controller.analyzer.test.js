/**
 * Controller Analyzer V1 — Test Suite
 *
 * WHY A STANDALONE TEST FILE
 * ──────────────────────────
 * Standard project practice: never integrate an untested analyzer.
 * This file tests the controller analyzer against common controller patterns
 * in isolation before we wire it into repository.analyzer.js.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/controller.analyzer.test.js
 *
 * Non-zero exit code means failure.
 */

import { analyzeControllers } from "../analyzers/controller.analyzer.js";

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
    };
}

// Helper to construct a mock repository structure
function makeRepo(content, path = "controllers/listing.js") {
    return {
        files: [{
            path,
            category: "controllers",
            extension: ".js",
            content,
        }],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Cases
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(" Controller Analyzer V1 — Test Suite");
console.log("══════════════════════════════════════════\n");

console.log("── Export Detection & Syntax Support ──");

test("supports CommonJS exports.name syntax", () => {
    const code = `
        exports.index = async (req, res) => {
            const listings = await Listing.find({});
            res.send(listings);
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results).toHaveLength(1);
    expect(results[0].exports).toHaveLength(1);
    expect(results[0].exports[0].name).toBe("index");
});

test("supports ES module inline export syntax", () => {
    const code = `
        export async function createListing(req, res) {
            const newListing = new Listing(req.body.listing);
            await newListing.save();
        }
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results).toHaveLength(1);
    expect(results[0].exports).toHaveLength(1);
    expect(results[0].exports[0].name).toBe("createListing");
});

test("supports ES module named export declarations", () => {
    const code = `
        const index = async (req, res) => {
            const items = await Listing.find({});
        };
        const show = async (req, res) => {};
        export { index, show };
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results).toHaveLength(1);
    expect(results[0].exports).toHaveLength(2);
    const names = results[0].exports.map(e => e.name);
    expect(names).toContain("index");
    expect(names).toContain("show");
});

test("supports CommonJS module.exports assignment object", () => {
    const code = `
        const index = async (req, res) => {
            const items = await Listing.find({});
        };
        const updateListing = async (req, res) => {
            await Listing.findByIdAndUpdate(req.params.id, req.body);
        };
        module.exports = {
            index,
            updateListing
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results).toHaveLength(1);
    expect(results[0].exports).toHaveLength(2);
    const names = results[0].exports.map(e => e.name);
    expect(names).toContain("index");
    expect(names).toContain("updateListing");
});

console.log("\n── Model & Operations Detection ──");

test("detects find method and generates appropriate business ops", () => {
    const code = `
        exports.index = async (req, res) => {
            const items = await Listing.find({});
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    const action = results[0].exports[0];
    expect(action.models).toEqual(["Listing"]);
    expect(action.methods).toEqual(["find"]);
    expect(action.operations).toContain("Find Listings");
    expect(action.operations).toContain("Filter Listings");
});

test("detects new model instantiation and save method", () => {
    const code = `
        exports.createListing = async (req, res) => {
            const item = new Listing(req.body);
            await item.save();
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    const action = results[0].exports[0];
    expect(action.models).toContain("Listing");
    expect(action.methods).toContain("save");
    expect(action.operations).toContain("Create Listing");
});

test("detects delete operations and pluralizes custom model names correctly", () => {
    const code = `
        exports.destroyReview = async (req, res) => {
            await Review.findByIdAndDelete(req.params.id);
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    const action = results[0].exports[0];
    expect(action.models).toContain("Review");
    expect(action.methods).toContain("findByIdAndDelete");
    expect(action.operations).toContain("Delete Review");
});

console.log("\n── Integrations Detection ──");

test("detects integrations (Cloudinary & Mapbox)", () => {
    const code = `
        exports.createListing = async (req, res) => {
            const geo = await geocoding.forwardGeocode({ query: "Delhi" }).send();
            const url = req.file.path; // Cloudinary upload triggers before controller via middleware
            // but controller references cloudinary.uploader or similar
            const result = await cloudinary.uploader.upload(url);
            const item = new Listing(req.body);
            await item.save();
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    const action = results[0].exports[0];
    expect(action.operations).toContain("Upload Image");
    expect(action.operations).toContain("Geocode Location");
});

test("detects authentication, payments, cache, and background jobs", () => {
    const code = `
        exports.checkout = async (req, res) => {
            await stripe.paymentIntents.create({});
            await redis.set("cache_key", "value");
            await myQueue.add("job", {});
            await passport.authenticate("local");
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    const action = results[0].exports[0];
    expect(action.operations).toContain("Process Payment");
    expect(action.operations).toContain("Cache Data");
    expect(action.operations).toContain("Background Jobs");
    expect(action.operations).toContain("Authenticate User");
});

console.log("\n── Edge Cases ──");

test("ignores non-exported local helper functions", () => {
    const code = `
        function helper() {
            // internal helper
        }
        exports.index = async (req, res) => {
            helper();
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results[0].exports).toHaveLength(1);
    expect(results[0].exports[0].name).toBe("index");
});

test("ignores functions inside comments", () => {
    const code = `
        // exports.oldIndex = async (req, res) => {
        //     await Listing.find({});
        // };
        exports.newIndex = async (req, res) => {
            await Listing.find({});
        };
    `;
    const results = analyzeControllers(makeRepo(code));
    expect(results[0].exports).toHaveLength(1);
    expect(results[0].exports[0].name).toBe("newIndex");
});

// ─────────────────────────────────────────────────────────────────────────────
// Print full output for visual inspection
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Visual Inspection Output ──\n");

const fullMockCode = `
const Listing = require("../models/listing");
const Review = require("../models/review");

// View all listings
exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
};

// Create listing with geocoding and image upload
exports.createListing = async (req, res) => {
    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();
    
    const url = req.file.path;
    const filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    
    await newListing.save();
    res.redirect("/listings");
};

// Delete review
exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(\`/listings/\${id}\`);
};
`;

const visualResults = analyzeControllers(makeRepo(fullMockCode, "controllers/listingController.js"));
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
