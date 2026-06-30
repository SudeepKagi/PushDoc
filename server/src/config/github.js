import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { App } from "@octokit/app";

dotenv.config();
console.log("App ID:", process.env.GITHUB_APP_ID);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(
    __dirname,
    "../../keys/pushdoc.2026-06-29.private-key.pem"

);
console.log("Key Path:", keyPath);
const privateKey = fs.readFileSync(keyPath, "utf8");

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey,
});

export default app;