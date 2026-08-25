import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { App } from "@octokit/app";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let privateKey;
if (process.env.GITHUB_PRIVATE_KEY) {
    privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");
} else if (process.env.GITHUB_PRIVATE_KEY_PATH) {
    if (!fs.existsSync(process.env.GITHUB_PRIVATE_KEY_PATH)) {
        throw new Error(`GitHub App private key not found at GITHUB_PRIVATE_KEY_PATH: ${process.env.GITHUB_PRIVATE_KEY_PATH}`);
    }
    privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, "utf8");
} else {
    const keyPath = path.join(
        __dirname,
        "../../keys/pushdoc.2026-06-29.private-key.pem"
    );
    if (fs.existsSync(keyPath)) {
        privateKey = fs.readFileSync(keyPath, "utf8");
    } else {
        throw new Error("GitHub App private key not configured. Please set GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH in environment variables.");
    }
}

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey,
});

export default app;