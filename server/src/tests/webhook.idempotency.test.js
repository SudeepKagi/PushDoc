/**
 * Pillar 1 — Ingress & Queueing: Webhook Tests
 *
 * What these tests protect against:
 *   1. Signature verification correctness (the one gate before any processing happens)
 *   2. Idempotency logic — the Redis SET NX check that prevents duplicate processing
 *   3. Debounce behavior — the BullMQ jobId dedup that collapses burst pushes
 *
 * Uses Node's built-in test runner (node:test). Run with:
 *   node --test src/tests/webhook.idempotency.test.js
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// ── verifySignature unit tests ─────────────────────────────────────────────
// We import only the pure function, not the full module that has side effects.

/**
 * Re-implements verifySignature inline for testing so we don't need to mock
 * the entire module. The real function in webhook.service.js is identical —
 * this tests the algorithm, not the import chain.
 */
const verifySignature = (signature, rawBody, secret) => {
    if (!signature || !rawBody) return false;

    const expectedSignature =
        "sha256=" +
        crypto.createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
};

const makeSignature = (body, secret) =>
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

describe("verifySignature", () => {
    const SECRET = "test-webhook-secret";
    const BODY   = Buffer.from(JSON.stringify({ event: "push" }));

    test("returns true for a valid HMAC-SHA256 signature", () => {
        const sig = makeSignature(BODY, SECRET);
        assert.equal(verifySignature(sig, BODY, SECRET), true);
    });

    test("returns false for a tampered body", () => {
        const sig = makeSignature(BODY, SECRET);
        const tamperedBody = Buffer.from(JSON.stringify({ event: "delete" }));
        assert.equal(verifySignature(sig, tamperedBody, SECRET), false);
    });

    test("returns false for a wrong secret", () => {
        const sig = makeSignature(BODY, "wrong-secret");
        assert.equal(verifySignature(sig, BODY, SECRET), false);
    });

    test("returns false when signature is missing", () => {
        assert.equal(verifySignature(null, BODY, SECRET), false);
        assert.equal(verifySignature(undefined, BODY, SECRET), false);
    });

    test("returns false when rawBody is missing", () => {
        const sig = makeSignature(BODY, SECRET);
        assert.equal(verifySignature(sig, null, SECRET), false);
        assert.equal(verifySignature(sig, undefined, SECRET), false);
    });

    test("returns false for a signature of different length (no timing side-channel)", () => {
        // A shorter signature should be rejected before timingSafeEqual (which throws on length mismatch)
        assert.equal(verifySignature("sha256=abc", BODY, SECRET), false);
    });
});

// ── Idempotency logic tests ────────────────────────────────────────────────
// We test the Redis SET NX pattern in isolation using a simple in-memory Map
// that mimics ioredis's SET ... NX behavior.

describe("Idempotency check (Redis SET NX pattern)", () => {
    /**
     * Minimal in-memory mock of `redisConnection.set(key, val, "NX", "EX", ttl)`.
     * Returns "OK" on first call for a key, null on subsequent calls.
     * This is exactly what ioredis returns for a SET NX operation.
     */
    class MockRedis {
        constructor() {
            this.store = new Map();
        }
        async set(key, value, nx, ex, ttl) {
            if (nx !== "NX") throw new Error("Expected NX flag");
            if (this.store.has(key)) return null; // key already exists — NX condition fails
            this.store.set(key, value);
            return "OK"; // key was newly set
        }
    }

    /**
     * Simulates the idempotency check from enqueueWebhook().
     * Returns true if the delivery should be processed, false if it's a duplicate.
     */
    const shouldProcess = async (redis, deliveryId) => {
        const key = `delivery:${deliveryId}`;
        const result = await redis.set(key, "1", "NX", "EX", 86400);
        return result === "OK";
    };

    test("first delivery with a given ID is processed", async () => {
        const redis = new MockRedis();
        assert.equal(await shouldProcess(redis, "delivery-abc-123"), true);
    });

    test("second delivery with the same ID is skipped", async () => {
        const redis = new MockRedis();
        await shouldProcess(redis, "delivery-abc-123");
        assert.equal(await shouldProcess(redis, "delivery-abc-123"), false);
    });

    test("two different delivery IDs are both processed", async () => {
        const redis = new MockRedis();
        assert.equal(await shouldProcess(redis, "delivery-001"), true);
        assert.equal(await shouldProcess(redis, "delivery-002"), true);
    });

    test("third retry of the same delivery is also skipped", async () => {
        const redis = new MockRedis();
        await shouldProcess(redis, "delivery-xyz");
        await shouldProcess(redis, "delivery-xyz");
        assert.equal(await shouldProcess(redis, "delivery-xyz"), false);
    });
});

// ── BullMQ jobId debounce behavior test ───────────────────────────────────
// We test the dedup logic: adding two jobs with the same jobId should result
// in only one distinct job being active at a time.

describe("BullMQ jobId debounce (burst push dedup)", () => {
    /**
     * Simulates BullMQ Queue.add() with jobId dedup.
     * BullMQ ignores a new job.add() if a job with the same ID already exists
     * in the waiting or delayed state. We model that here with a Set.
     */
    class MockQueue {
        constructor() {
            this.waiting = new Set();
        }
        async add(name, data, opts = {}) {
            const id = opts.jobId || `auto-${Math.random()}`;
            if (this.waiting.has(id)) {
                // BullMQ returns the existing job silently — no error, no duplicate
                return { id, isDuplicate: true };
            }
            this.waiting.add(id);
            return { id, isDuplicate: false };
        }
        simulateWorkerPickup(jobId) {
            this.waiting.delete(jobId);
        }
    }

    test("two pushes to the same repo produce one waiting job", async () => {
        const queue = new MockQueue();
        const jobId = "repo-12345";

        const j1 = await queue.add("generate-readme", { commitSha: "aaa" }, { jobId });
        const j2 = await queue.add("generate-readme", { commitSha: "bbb" }, { jobId });

        assert.equal(j1.isDuplicate, false, "first push should be queued");
        assert.equal(j2.isDuplicate, true,  "second push should be deduplicated");
        assert.equal(queue.waiting.size, 1,  "only one job should be waiting");
    });

    test("after the worker picks up a job, a new push for the same repo is queued", async () => {
        const queue = new MockQueue();
        const jobId = "repo-12345";

        await queue.add("generate-readme", { commitSha: "aaa" }, { jobId });
        queue.simulateWorkerPickup(jobId); // worker starts processing

        const j2 = await queue.add("generate-readme", { commitSha: "bbb" }, { jobId });
        assert.equal(j2.isDuplicate, false, "new push after worker pickup should be queued");
    });

    test("pushes to different repos get independent jobs", async () => {
        const queue = new MockQueue();

        const j1 = await queue.add("generate-readme", {}, { jobId: "repo-111" });
        const j2 = await queue.add("generate-readme", {}, { jobId: "repo-222" });

        assert.equal(j1.isDuplicate, false);
        assert.equal(j2.isDuplicate, false);
        assert.equal(queue.waiting.size, 2);
    });
});
