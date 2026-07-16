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
} else {
    const keyPath = path.join(
        __dirname,
        "../../keys/pushdoc.2026-06-29.private-key.pem"
    );
    privateKey = fs.readFileSync(keyPath, "utf8");
}

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey,
});

export default app;