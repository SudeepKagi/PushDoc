import { config } from "../config/app.config.js";

const LEVELS = {
    DEBUG:   0,
    INFO:    1,
    SUCCESS: 2,
    WARN:    3,
    ERROR:   4,
};

const CURRENT_LEVEL = config.env === "production" ? LEVELS.INFO : LEVELS.DEBUG;

import fs from "fs";
import path from "path";

const writeLogToFile = (jobId, logLine) => {
    try {
        const logDir = path.join("temp", "logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(path.join(logDir, `${jobId}.log`), logLine + "\n");
    } catch (err) {
        console.error("Failed to write log to file:", err.message);
    }
};

const formatLog = (levelIcon, levelName, jobIdOrMsg, msg) => {
    const timestamp = new Date().toISOString();
    let jobId = "";
    let message = jobIdOrMsg;

    if (msg !== undefined) {
        jobId = ` [Job ${jobIdOrMsg}]`;
        message = msg;
        const line = `[${timestamp}]${jobId} ${levelIcon} ${levelName}: ${message}`;
        writeLogToFile(jobIdOrMsg, line);
        return line;
    }

    return `[${timestamp}]${jobId} ${levelIcon} ${levelName}: ${message}`;
};

export const divider = () => {
    console.log("================================================================================");
};

export const debug = (jobIdOrMsg, msg) => {
    if (CURRENT_LEVEL <= LEVELS.DEBUG) {
        console.log(formatLog("🐛", "DEBUG", jobIdOrMsg, msg));
    }
};

export const info = (jobIdOrMsg, msg) => {
    if (CURRENT_LEVEL <= LEVELS.INFO) {
        console.log(formatLog("ℹ️", "INFO", jobIdOrMsg, msg));
    }
};

export const success = (jobIdOrMsg, msg) => {
    if (CURRENT_LEVEL <= LEVELS.SUCCESS) {
        console.log(formatLog("✅", "SUCCESS", jobIdOrMsg, msg));
    }
};

export const warn = (jobIdOrMsg, msg) => {
    if (CURRENT_LEVEL <= LEVELS.WARN) {
        console.warn(formatLog("⚠️", "WARN", jobIdOrMsg, msg));
    }
};

export const error = (jobIdOrMsg, msg) => {
    if (CURRENT_LEVEL <= LEVELS.ERROR) {
        console.error(formatLog("❌", "ERROR", jobIdOrMsg, msg));
    }
};