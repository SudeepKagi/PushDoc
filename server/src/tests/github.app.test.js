import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Octokit } from "@octokit/rest";
import { App } from "@octokit/app";

describe("GitHub App Octokit REST pagination suite", () => {
    test("App.defaults({ Octokit }) configures paginate on installation instances", async () => {
        const GitHubApp = App.defaults({ Octokit });
        const app = new GitHubApp({
            appId: 12345,
            privateKey: "dummy-key",
        });

        // App instance's octokit should have paginate
        assert.equal(typeof app.octokit.paginate, "function");

        // Generated installation octokit should have paginate and request
        const installationOctokit = await app.getInstallationOctokit(99999);
        assert.equal(typeof installationOctokit.paginate, "function");
        assert.equal(typeof installationOctokit.request, "function");
    });
});
