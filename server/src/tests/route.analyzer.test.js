/**
 * Route Analyzer V2 — Test Suite
 *
 * WHY A STANDALONE TEST FILE
 * ──────────────────────────
 * We follow the rule: never integrate an untested analyzer.
 * This file lets us validate the analyzer against real-world Express
 * code patterns in isolation, before wiring it into the pipeline.
 *
 * HOW TO RUN
 * ──────────
 *   node --experimental-vm-modules src/tests/route.analyzer.test.js
 *
 * Or from the server/ directory:
 *   node src/tests/route.analyzer.test.js
 *
 * No test framework required — plain Node with ES modules.
 * Output is printed to stdout. A non-zero exit code means failure.
 */

import { analyzeRoutes } from "../analyzers/route.analyzer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal test harness
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
            if (a !== b) {
                throw new Error(`Expected\n  ${b}\ngot\n  ${a}`);
            }
        },
        toHaveLength(n) {
            if (actual.length !== n) {
                throw new Error(
                    `Expected length ${n}, got ${actual.length}. Items: ${JSON.stringify(actual)}`
                );
            }
        },
        toContain(value) {
            if (!actual.includes(value)) {
                throw new Error(
                    `Expected array to contain ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`
                );
            }
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a fake repository with a single route file
// ─────────────────────────────────────────────────────────────────────────────

function makeRepo(content) {
    return {
        files: [
            {
                path:     "routes/listing.js",
                category: "routes",
                extension: ".js",
                content,
            },
        ],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test cases
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(" Route Analyzer V2 — Test Suite");
console.log("══════════════════════════════════════════\n");

// ── 1. Simple GET route ──────────────────────────────────────────────────────

console.log("── Simple routes ──");

test("simple GET route with single controller", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.get("/", listingController.index);
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe("GET");
    expect(routes[0].path).toBe("/");
    expect(routes[0].controller).toBe("listingController.index");
    expect(routes[0].middlewares).toEqual([]);
});

test("simple POST route with one middleware", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.post("/", isLoggedIn, listingController.createListing);
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe("POST");
    expect(routes[0].middlewares).toEqual(["isLoggedIn"]);
    expect(routes[0].controller).toBe("listingController.createListing");
});

test("DELETE route with two middlewares", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].method).toBe("DELETE");
    expect(routes[0].controller).toBe("listingController.deleteListing");
    expect(routes[0].middlewares).toEqual(["isLoggedIn", "isOwner"]);
});

// ── 2. wrapAsync unwrapping ──────────────────────────────────────────────────

console.log("\n── wrapAsync ──");

test("wrapAsync is unwrapped from controller", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.get("/:id", wrapAsync(listingController.showListing));
    `));
    expect(routes[0].controller).toBe("listingController.showListing");
});

test("wrapAsync with spaces is unwrapped", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.get("/:id", wrapAsync( listingController.showListing ));
    `));
    expect(routes[0].controller).toBe("listingController.showListing");
});

// ── 3. upload.single ────────────────────────────────────────────────────────

console.log("\n── upload.single (nested parens) ──");

test("upload.single with bracket notation in arg is correctly isolated", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.post(
            "/",
            isLoggedIn,
            upload.single("listing[image]"),
            validateListing,
            wrapAsync(listingController.createListing)
        );
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].controller).toBe("listingController.createListing");
    expect(routes[0].middlewares).toEqual([
        "isLoggedIn",
        'upload.single("listing[image]")',
        "validateListing",
    ]);
});

test("upload.single does not break argument count", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.put(
            "/:id",
            isLoggedIn,
            isOwner,
            upload.single("listing[image]"),
            validateListing,
            wrapAsync(listingController.updateListing)
        );
    `));
    expect(routes[0].middlewares).toHaveLength(4);
});

// ── 4. passport.authenticate ────────────────────────────────────────────────

console.log("\n── passport.authenticate (nested object literal) ──");

test("passport.authenticate with options object is a single middleware token", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.post(
            "/login",
            saveRedirectUrl,
            passport.authenticate("local", {
                failureRedirect: "/login",
                failureFlash: true,
            }),
            userController.login
        );
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].controller).toBe("userController.login");
    expect(routes[0].middlewares).toHaveLength(2);
    expect(routes[0].middlewares[0]).toBe("saveRedirectUrl");
    // The passport call should be a single entry (not split on the inner comma)
    const passportMw = routes[0].middlewares[1];
    if (!passportMw.startsWith('passport.authenticate')) {
        throw new Error(
            `Expected passport.authenticate(...) as a single token, got: ${passportMw}`
        );
    }
});

// ── 5. Chained routes ────────────────────────────────────────────────────────

console.log("\n── Chained routes (router.route) ──");

test("chained route produces one entry per method", () => {
    const routes = analyzeRoutes(makeRepo(`
        router
            .route("/")
            .get(wrapAsync(listingController.index))
            .post(
                isLoggedIn,
                upload.single("listing[image]"),
                validateListing,
                wrapAsync(listingController.createListing)
            );
    `));
    expect(routes).toHaveLength(2);
    const get  = routes.find((r) => r.method === "GET");
    const post = routes.find((r) => r.method === "POST");
    if (!get)  throw new Error("GET route not found");
    if (!post) throw new Error("POST route not found");
    expect(get.path).toBe("/");
    expect(get.controller).toBe("listingController.index");
    expect(get.middlewares).toEqual([]);
    expect(post.controller).toBe("listingController.createListing");
    expect(post.middlewares).toHaveLength(3);
});

test("chained route /:id with GET PUT DELETE", () => {
    const routes = analyzeRoutes(makeRepo(`
        router
            .route("/:id")
            .get(wrapAsync(listingController.showListing))
            .put(
                isLoggedIn,
                isOwner,
                upload.single("listing[image]"),
                validateListing,
                wrapAsync(listingController.updateListing)
            )
            .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
    `));
    expect(routes).toHaveLength(3);
    const del = routes.find((r) => r.method === "DELETE");
    expect(del.controller).toBe("listingController.deleteListing");
    expect(del.middlewares).toEqual(["isLoggedIn", "isOwner"]);
});

// ── 6. Comments are ignored ──────────────────────────────────────────────────

console.log("\n── Comment stripping ──");

test("routes inside line comments are ignored", () => {
    const routes = analyzeRoutes(makeRepo(`
        // router.get("/old", oldController.index);
        router.get("/new", newController.index);
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe("/new");
});

test("routes inside block comments are ignored", () => {
    const routes = analyzeRoutes(makeRepo(`
        /* router.post("/disabled", someController.action); */
        router.get("/active", someController.show);
    `));
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe("/active");
});

// ── 7. Mixed file (signup + login + logout) ──────────────────────────────────

console.log("\n── Real-world user router ──");

test("user router with signup, login, logout routes", () => {
    const routes = analyzeRoutes(makeRepo(`
        // Signup
        router
            .route("/signup")
            .get(userController.renderSignup)
            .post(wrapAsync(userController.signup));

        // Login
        router
            .route("/login")
            .get(userController.renderLogin)
            .post(
                saveRedirectUrl,
                passport.authenticate("local", {
                    failureRedirect: "/login",
                    failureFlash: true,
                }),
                userController.login
            );

        // Logout
        router.get("/logout", userController.logout);
    `));

    expect(routes).toHaveLength(5);

    const methods = routes.map((r) => r.method);
    expect(methods.filter((m) => m === "GET").length).toBe(3);
    expect(methods.filter((m) => m === "POST").length).toBe(2);

    const loginPost = routes.find(
        (r) => r.method === "POST" && r.path === "/login"
    );
    if (!loginPost) throw new Error("POST /login not found");
    expect(loginPost.controller).toBe("userController.login");
    expect(loginPost.middlewares).toHaveLength(2);
});

// ── 8. File path is tracked ──────────────────────────────────────────────────

console.log("\n── File attribution ──");

test("each route records its source file path", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.get("/", listingController.index);
    `));
    expect(routes[0].file).toBe("routes/listing.js");
});

// ── 9. Multiple route files ──────────────────────────────────────────────────

console.log("\n── Multiple files ──");

test("routes from two files are combined", () => {
    const repo = {
        files: [
            {
                path: "routes/listing.js",
                category: "routes",
                extension: ".js",
                content: `router.get("/listings", listingController.index);`,
            },
            {
                path: "routes/review.js",
                category: "routes",
                extension: ".js",
                content: `router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));`,
            },
        ],
    };
    const routes = analyzeRoutes(repo);
    expect(routes).toHaveLength(2);
    const files = routes.map((r) => r.file);
    expect(files).toContain("routes/listing.js");
    expect(files).toContain("routes/review.js");
});

// ── 10. Edge cases ────────────────────────────────────────────────────────────

console.log("\n── Edge cases ──");

test("empty content produces no routes", () => {
    const routes = analyzeRoutes(makeRepo(""));
    expect(routes).toHaveLength(0);
});

test("non-route file is ignored", () => {
    const repo = {
        files: [
            {
                path:     "controllers/listing.js",
                category: "controllers",
                extension: ".js",
                content:  `router.get("/", listingController.index);`,
            },
        ],
    };
    const routes = analyzeRoutes(repo);
    expect(routes).toHaveLength(0);
});

test("route with only a path and no handler is skipped", () => {
    const routes = analyzeRoutes(makeRepo(`
        router.get("/broken");
    `));
    expect(routes).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(` Results: ${passed} passed, ${failed} failed`);
console.log("══════════════════════════════════════════\n");

if (failed > 0) {
    process.exit(1);
}
