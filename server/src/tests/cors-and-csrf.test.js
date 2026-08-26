import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { corsOptions, getAllowedOrigins, isAllowedOrigin } from "../config/cors.config.js";
import { requireTrustedOriginForCookieSession } from "../middleware/csrf.middleware.js";

describe("CORS allowlist and cookie CSRF protection", () => {
    test("accepts configured origins and rejects lookalike hosted origins", () => {
        const configuredOrigin = [...getAllowedOrigins()][0];
        assert.ok(configuredOrigin, "the server must configure at least one allowed frontend origin");
        assert.equal(isAllowedOrigin(configuredOrigin), true);
        assert.equal(isAllowedOrigin("https://attacker.vercel.app"), false);
        assert.equal(isAllowedOrigin("https://attacker.onrender.com"), false);
    });

    test("returns a 403 CORS error for a non-allowlisted browser origin", () => {
        corsOptions.origin("https://attacker.vercel.app", (error, allowed) => {
            assert.equal(error.status, 403);
            assert.equal(allowed, false);
        });
    });

    test("blocks a cross-site write made with a session cookie", () => {
        let statusCode;
        let body;
        const req = {
            method: "POST",
            cookies: { auth_token: "session" },
            get: () => "https://attacker.vercel.app",
        };
        const res = {
            status: (code) => {
                statusCode = code;
                return res;
            },
            json: (value) => {
                body = value;
            },
        };

        requireTrustedOriginForCookieSession(req, res, () => assert.fail("next must not be called"));

        assert.equal(statusCode, 403);
        assert.deepEqual(body, { success: false, message: "Cross-site request blocked" });
    });
});
