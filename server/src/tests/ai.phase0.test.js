import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { FAILURE_ACTION, getFailureAction } from "../utils/ai.utils.js";
import { embeddingCacheKey, chunkRepository } from "../services/embedding.service.js";
import { validateAndSanitizeReadme } from "../services/validator.service.js";
import { shouldIgnoreDirectory } from "../readers/ignore.rules.js";

describe("Phase 0 AI reliability regressions", () => {
    test("routes retired or unavailable models to the next provider", () => {
        assert.equal(getFailureAction({ status: 404 }), FAILURE_ACTION.FALLBACK);
        assert.equal(getFailureAction({ statusCode: 410 }), FAILURE_ACTION.FALLBACK);
    });

    test("routes truncation, safety blocks, and empty output to fallback", () => {
        for (const code of ["MAX_TOKENS", "LENGTH", "SAFETY", "EMPTY_OUTPUT"]) {
            assert.equal(getFailureAction({ code }), FAILURE_ACTION.FALLBACK);
        }
    });

    test("retries transient provider errors and rejects unclassified failures", () => {
        assert.equal(getFailureAction({ status: 503 }), FAILURE_ACTION.RETRY_KEY);
        assert.equal(getFailureAction({ code: "ETIMEDOUT" }), FAILURE_ACTION.RETRY_KEY);
        assert.equal(getFailureAction({ status: 401 }), FAILURE_ACTION.FATAL);
    });

    test("keeps repeated spaces inside fenced code intact", () => {
        const readme = "# Example\n\n```yaml\nkey:  value\n  nested: true\n```\n";
        assert.equal(validateAndSanitizeReadme(readme, { package: { dependencies: [] } }), readme);
    });

    test("keys cached embeddings by model and dimensions as well as content", () => {
        const first = embeddingCacheKey("same source", "model-a", 768);
        assert.notEqual(first, embeddingCacheKey("same source", "model-b", 768));
        assert.notEqual(first, embeddingCacheKey("same source", "model-a", 1536));
        assert.notEqual(first, embeddingCacheKey("changed source", "model-a", 768));
    });

    test("does not discard repository chunks after an arbitrary first 25", () => {
        const files = Array.from({ length: 30 }, (_, index) => ({
            path: `src/file-${index}.js`, extension: ".js", content: `export const value${index} = ${index};`,
        }));
        assert.equal(chunkRepository(files).length, 30);
    });

    test("ignores common Python, JVM, and vendor dependency directories", () => {
        for (const name of ["venv", ".venv", "__pycache__", "target", "vendor"]) {
            assert.equal(shouldIgnoreDirectory(name), true);
        }
    });
});
