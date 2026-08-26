import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { belongsToInstallation } from "../services/authorization.service.js";

describe("installation resource authorization", () => {
    const installation = { _id: { toString: () => "installation-a" } };

    test("allows a resource owned by the requester's installation", () => {
        const repository = {
            installation: { _id: { toString: () => "installation-a" } },
        };

        assert.equal(belongsToInstallation(repository, installation), true);
    });

    test("denies a resource from another installation", () => {
        const job = {
            installation: { _id: { toString: () => "installation-b" } },
        };

        assert.equal(belongsToInstallation(job, installation), false);
    });

    test("denies resources without an installation", () => {
        assert.equal(belongsToInstallation({}, installation), false);
    });
});
