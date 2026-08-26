import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { App } from "@octokit/app";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app;

const loadPrivateKey = () => {
    if (process.env.GITHUB_PRIVATE_KEY) {
        return process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");
    }

    if (process.env.GITHUB_PRIVATE_KEY_PATH) {
        if (!fs.existsSync(process.env.GITHUB_PRIVATE_KEY_PATH)) {
            throw new Error("GitHub App private key path does not exist");
        }
        return fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, "utf8");
    }

    const keyPath = path.join(
        __dirname,
        "../../keys/pushdoc.2026-06-29.private-key.pem"
    );
    if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, "utf8");
    }

    throw new Error("GitHub App private key is not configured");
};

// Construct the GitHub client only when a GitHub operation is requested.
// This keeps module imports (including the HTTP test suite) independent from
// production-only credentials. server.js still validates those credentials
// before accepting real traffic.
export const getGitHubApp = () => {
    if (!app) {
        app = new App({
            appId: process.env.GITHUB_APP_ID,
            privateKey: loadPrivateKey(),
        });
    }

    return app;
};
