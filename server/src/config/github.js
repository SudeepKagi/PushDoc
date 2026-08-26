import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GitHubApp = App.defaults({ Octokit });

let app;

const loadPrivateKey = () => {
    if (process.env.GITHUB_PRIVATE_KEY) {
        let key = process.env.GITHUB_PRIVATE_KEY.trim();
        // Strip surrounding quotes if configured with quotes in cloud environment
        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
            key = key.slice(1, -1);
        }
        // Decode base64 if key was base64-encoded to preserve formatting
        if (!key.includes("-----BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
            try {
                const decoded = Buffer.from(key, "base64").toString("utf8");
                if (decoded.includes("-----BEGIN")) {
                    key = decoded;
                }
            } catch {}
        }
        return key.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
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
        const rawAppId = process.env.GITHUB_APP_ID;
        const appId = !isNaN(Number(rawAppId)) ? Number(rawAppId) : rawAppId;
        app = new GitHubApp({
            appId,
            privateKey: loadPrivateKey(),
        });
    }

    return app;
};
