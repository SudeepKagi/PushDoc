/**
 * Security & Path Traversal Validation Test Suite
 *
 * Standalone Node test file.
 *
 * HOW TO RUN
 * ──────────
 *   node src/tests/security.test.js
 *
 * Non-zero exit code means failure.
 */

import { createWorkspace, getRepositoryPath, cleanupWorkspace } from "../services/workspace.service.js";
import { createAuthenticatedCloneUrl, pushChanges } from "../services/git.service.js";
import { ValidationError, GitError } from "../utils/errors.js";

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

function expect(fn) {
    return {
        toThrow(errorClass) {
            try {
                fn();
            } catch (err) {
                if (errorClass && !(err instanceof errorClass)) {
                    throw new Error(`Expected error of type ${errorClass.name}, but got ${err.constructor.name}: ${err.message}`);
                }
                return; // Passed
            }
            throw new Error("Expected function to throw, but it succeeded");
        }
    };
}

console.log("\n══════════════════════════════════════════");
console.log(" Security & Path Traversal — Test Suite");
console.log("══════════════════════════════════════════\n");

console.log("── Workspace Path Traversal Verification ──");

test("blocks path traversal in createWorkspace via malicious jobId", () => {
    expect(() => {
        createWorkspace("../malicious-folder");
    }).toThrow(ValidationError);

    expect(() => {
        createWorkspace("123/../../etc");
    }).toThrow(ValidationError);
});

test("blocks path traversal in getRepositoryPath via malicious repo name", () => {
    expect(() => {
        getRepositoryPath("123", "../bypass");
    }).toThrow(ValidationError);

    expect(() => {
        getRepositoryPath("123", "subfolder/..\\file");
    }).toThrow(ValidationError);
});

test("blocks path traversal in cleanupWorkspace via malicious jobId", () => {
    expect(() => {
        cleanupWorkspace("..\\..\\malicious");
    }).toThrow(ValidationError);
});

console.log("\n── Git Token Redaction & Sanitization ──");

test("validates Git clone auth URL builder arguments", () => {
    expect(() => {
        createAuthenticatedCloneUrl("", "token123");
    }).toThrow(ValidationError);

    expect(() => {
        createAuthenticatedCloneUrl("https://github.com/foo/bar.git", "");
    }).toThrow(ValidationError);
});

test("blocks git push on invalid branch formats", async () => {
    try {
        await pushChanges("temp/workspaces/123/repo", "refs/heads/main; rm -rf /");
        throw new Error("Expected pushChanges to throw ValidationError on invalid characters, but it succeeded");
    } catch (err) {
        if (!(err instanceof ValidationError)) {
            throw new Error(`Expected ValidationError, got ${err.constructor.name}: ${err.message}`);
        }
    }

    try {
        await pushChanges("temp/workspaces/123/repo", "main && echo hacked");
        throw new Error("Expected pushChanges to throw ValidationError on invalid character sequence, but it succeeded");
    } catch (err) {
        if (!(err instanceof ValidationError)) {
            throw new Error(`Expected ValidationError, got ${err.constructor.name}: ${err.message}`);
        }
    }
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
