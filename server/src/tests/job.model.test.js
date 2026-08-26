import { test } from "node:test";
import assert from "node:assert/strict";
import Job from "../models/job.model.js";

test("Job defines indexes for stale-job reaper queries", () => {
    const indexes = Job.schema.indexes().map(([spec]) => spec);

    assert.ok(indexes.some(index => index.status === 1 && index.createdAt === 1));
    assert.ok(indexes.some(index => index.status === 1 && index.updatedAt === 1));
});
