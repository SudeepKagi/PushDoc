/**
 * Model Analyzer V1 — Test Suite
 *
 * WHY A STANDALONE TEST FILE
 * ──────────────────────────
 * Rule: never integrate an untested analyzer.
 * This file tests the model analyzer against real Mongoose model patterns
 * in isolation before wiring into repository.analyzer.js.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/model.analyzer.test.js
 *
 * No test framework. Plain Node with ES modules.
 * Non-zero exit code means failure.
 */

import { analyzeModels } from "../analyzers/model.analyzer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal test harness (same as route.analyzer.test.js)
// ─────────────────────────────────────────────────────────────────────────────

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
        toBeNull() {
            if (actual !== null) throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
        },
        toBeTruthy() {
            if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeRepo(content, category = "models", filePath = "models/listing.js") {
    return {
        files: [{
            path:     filePath,
            category,
            extension: ".js",
            content,
        }],
    };
}

function findField(model, name) {
    return model.fields.find((f) => f.name === name);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test data
// ─────────────────────────────────────────────────────────────────────────────

// The real Listing model from the sample project
const LISTING_MODEL = `
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  category: {
    type: String,
    enum: [
      'Forest',
      'Mountain',
      'Beach',
      'Desert',
      'Farm',
      'Luxury',
      'Camping',
    ],
    required: true,
  },
});

listingSchema.post('findOneAndDelete', async function (listing) {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

listingSchema.index({ geometry: '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
`;

// The real Review model from the sample project
const REVIEW_MODEL = `
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
`;

// The real User model
const USER_MODEL = `
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
`;

// A model with unique, default, and enum
const SUBSCRIBER_MODEL = `
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
`;

// A model with pre hook and compound index
const PRODUCT_MODEL = `
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  price: { type: Number, min: 0 },
  stock: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

productSchema.pre('save', async function () {
  this.slug = this.name.toLowerCase().replace(/ /g, '-');
});

productSchema.index({ name: 1 }, { unique: true });
productSchema.index({ price: 1, stock: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
`;

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(" Model Analyzer V1 — Test Suite");
console.log("══════════════════════════════════════════\n");

// ── 1. File detection ────────────────────────────────────────────────────────

console.log("── File detection ──");

test("files in models/ category are picked up", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL, "models"));
    expect(models).toHaveLength(1);
});

test("files with category 'model' (singular) are picked up", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL, "model"));
    expect(models).toHaveLength(1);
});

test("files with path containing /models/ are picked up", () => {
    const repo = {
        files: [{
            path:     "src/models/review.js",
            category: "src",
            extension: ".js",
            content:  REVIEW_MODEL,
        }],
    };
    const models = analyzeModels(repo);
    expect(models).toHaveLength(1);
});

test("non-model files are ignored", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL, "controllers"));
    expect(models).toHaveLength(0);
});

test("empty content produces no models", () => {
    const models = analyzeModels(makeRepo(""));
    expect(models).toHaveLength(0);
});

// ── 2. Model name resolution ─────────────────────────────────────────────────

console.log("\n── Model name resolution ──");

test("Listing model name is resolved correctly", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    expect(models[0].name).toBe("Listing");
});

test("Review model name is resolved correctly", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    expect(models[0].name).toBe("Review");
});

test("User model name is resolved correctly", () => {
    const models = analyzeModels(makeRepo(USER_MODEL, "models", "models/user.js"));
    expect(models[0].name).toBe("User");
});

test("Subscriber model name is resolved correctly", () => {
    const models = analyzeModels(makeRepo(SUBSCRIBER_MODEL));
    expect(models[0].name).toBe("Subscriber");
});

// ── 3. Collection inference ──────────────────────────────────────────────────

console.log("\n── Collection inference ──");

test("Listing → listings", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    expect(models[0].collection).toBe("listings");
});

test("Review → reviews", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    expect(models[0].collection).toBe("reviews");
});

test("User → users", () => {
    const models = analyzeModels(makeRepo(USER_MODEL, "models", "models/user.js"));
    expect(models[0].collection).toBe("users");
});

test("Subscriber → subscribers", () => {
    const models = analyzeModels(makeRepo(SUBSCRIBER_MODEL));
    expect(models[0].collection).toBe("subscribers");
});

test("Product → products", () => {
    const models = analyzeModels(makeRepo(PRODUCT_MODEL));
    expect(models[0].collection).toBe("products");
});

// ── 4. Field extraction — types ──────────────────────────────────────────────

console.log("\n── Field extraction — types ──");

test("String field type is extracted correctly", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "title");
    expect(field.type).toBe("String");
});

test("Number field type is extracted correctly", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "price");
    expect(field.type).toBe("Number");
});

test("ObjectId ref field is extracted (owner)", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "owner");
    expect(field.type).toBe("ObjectId");
    expect(field.ref).toBe("User");
});

test("Array of ObjectId refs is extracted (reviews)", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "reviews");
    expect(field.type).toBe("Array<ObjectId>");
    expect(field.ref).toBe("Review");
});

test("Shorthand String field is extracted (comment)", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    const field  = findField(models[0], "comment");
    expect(field.type).toBe("String");
});

test("Array<String> shorthand is extracted (tags)", () => {
    const models = analyzeModels(makeRepo(PRODUCT_MODEL));
    const field  = findField(models[0], "tags");
    expect(field.type).toBe("Array<String>");
});

// ── 5. Field constraints ─────────────────────────────────────────────────────

console.log("\n── Field constraints ──");

test("required: true is extracted on title", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "title");
    expect(field.required).toBe(true);
});

test("required: true is extracted on price", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "price");
    expect(field.required).toBe(true);
});

test("min is extracted on rating", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    const field  = findField(models[0], "rating");
    expect(field.min).toBe("1");
});

test("max is extracted on rating", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    const field  = findField(models[0], "rating");
    expect(field.max).toBe("5");
});

test("unique is extracted on email", () => {
    const models = analyzeModels(makeRepo(SUBSCRIBER_MODEL));
    const field  = findField(models[0], "email");
    expect(field.unique).toBe(true);
});

test("enum is extracted on category", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    const field  = findField(models[0], "category");
    if (!field) throw new Error("category field not found");
    if (!Array.isArray(field.enum)) {
        throw new Error(`Expected enum to be an array, got ${JSON.stringify(field.enum)}`);
    }
    if (!field.enum.includes("Forest")) {
        throw new Error(`Expected enum to contain "Forest", got ${JSON.stringify(field.enum)}`);
    }
});

// ── 6. Indexes ───────────────────────────────────────────────────────────────

console.log("\n── Indexes ──");

test("2dsphere index is extracted on Listing", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    expect(models[0].indexes).toContain("2dsphere");
});

test("compound index is extracted on Product", () => {
    const models = analyzeModels(makeRepo(PRODUCT_MODEL));
    if (models[0].indexes.length < 1) {
        throw new Error(`Expected at least 1 index, got ${JSON.stringify(models[0].indexes)}`);
    }
});

// ── 7. Hooks ─────────────────────────────────────────────────────────────────

console.log("\n── Lifecycle hooks ──");

test("post(findOneAndDelete) hook is extracted on Listing", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL));
    expect(models[0].middleware).toContain("post(findOneAndDelete)");
});

test("pre(save) hook is extracted on Product", () => {
    const models = analyzeModels(makeRepo(PRODUCT_MODEL));
    expect(models[0].middleware).toContain("pre(save)");
});

test("model with no hooks has empty middleware array", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    expect(models[0].middleware).toHaveLength(0);
});

// ── 8. Plugins ───────────────────────────────────────────────────────────────

console.log("\n── Plugins ──");

test("passportLocalMongoose plugin is extracted on User", () => {
    const models = analyzeModels(makeRepo(USER_MODEL, "models", "models/user.js"));
    expect(models[0].plugins).toContain("passportLocalMongoose");
});

test("model with no plugins has empty plugins array", () => {
    const models = analyzeModels(makeRepo(REVIEW_MODEL));
    expect(models[0].plugins).toHaveLength(0);
});

// ── 9. Multi-model repository ────────────────────────────────────────────────

console.log("\n── Multi-model repository ──");

test("all three models are extracted from a multi-file repo", () => {
    const repo = {
        files: [
            { path: "models/listing.js",    category: "models", extension: ".js", content: LISTING_MODEL },
            { path: "models/review.js",     category: "models", extension: ".js", content: REVIEW_MODEL },
            { path: "models/user.js",       category: "models", extension: ".js", content: USER_MODEL },
            { path: "models/subscriber.js", category: "models", extension: ".js", content: SUBSCRIBER_MODEL },
        ],
    };
    const models = analyzeModels(repo);
    expect(models).toHaveLength(4);
    const names = models.map((m) => m.name);
    if (!names.includes("Listing"))    throw new Error("Listing not found");
    if (!names.includes("Review"))     throw new Error("Review not found");
    if (!names.includes("User"))       throw new Error("User not found");
    if (!names.includes("Subscriber")) throw new Error("Subscriber not found");
});

// ── 10. File attribution ─────────────────────────────────────────────────────

console.log("\n── File attribution ──");

test("each model records its source file path", () => {
    const models = analyzeModels(makeRepo(LISTING_MODEL, "models", "models/listing.js"));
    expect(models[0].file).toBe("models/listing.js");
});

// ── 11. Edge cases ───────────────────────────────────────────────────────────

console.log("\n── Edge cases ──");

test("malformed source does not crash the analyzer", () => {
    const models = analyzeModels(makeRepo("const x = new Schema({ title: {"));
    expect(models).toHaveLength(0);
});

test("commented-out schema definitions are ignored", () => {
    const content = `
        // const fakeSchema = new Schema({ title: String });
        const realSchema = new Schema({ name: String });
        module.exports = mongoose.model("Real", realSchema);
    `;
    const models = analyzeModels(makeRepo(content));
    expect(models).toHaveLength(1);
    expect(models[0].name).toBe("Real");
});

test("inline model with new Schema() is parsed", () => {
    const content = `
        module.exports = mongoose.model("Tag", new mongoose.Schema({
            name: { type: String, required: true, unique: true },
            slug: String,
        }));
    `;
    const models = analyzeModels(makeRepo(content));
    expect(models).toHaveLength(1);
    expect(models[0].name).toBe("Tag");
    const nameField = findField(models[0], "name");
    if (!nameField) throw new Error("name field not found on Tag model");
    expect(nameField.required).toBe(true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Print full output of all models for visual inspection
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Full model output (visual inspection) ──\n");

const fullRepo = {
    files: [
        { path: "models/listing.js",    category: "models", extension: ".js", content: LISTING_MODEL },
        { path: "models/review.js",     category: "models", extension: ".js", content: REVIEW_MODEL },
        { path: "models/user.js",       category: "models", extension: ".js", content: USER_MODEL },
        { path: "models/subscriber.js", category: "models", extension: ".js", content: SUBSCRIBER_MODEL },
        { path: "models/product.js",    category: "models", extension: ".js", content: PRODUCT_MODEL },
    ],
};

const allModels = analyzeModels(fullRepo);
console.log(JSON.stringify(allModels, null, 2));

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log("══════════════════════════════════════════\n");

if (failed > 0) {
    process.exit(1);
}
