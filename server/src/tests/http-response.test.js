import { test } from "node:test";
import assert from "node:assert/strict";
import { publicErrorMessage } from "../utils/http-response.js";
import { ValidationError } from "../utils/errors.js";

test("server errors never expose their internal messages", () => {
    assert.equal(
        publicErrorMessage(new Error("MongoDB connection string leaked"), 500),
        "Internal server error"
    );
    assert.equal(
        publicErrorMessage(new Error("Upstream timeout details"), 502),
        "An upstream service is temporarily unavailable"
    );
});

test("intentional validation guidance remains visible", () => {
    assert.equal(
        publicErrorMessage(new ValidationError("Repository ID is required"), 400),
        "Repository ID is required"
    );
});
