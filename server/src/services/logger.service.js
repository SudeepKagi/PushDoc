import { config } from "../config/app.config.js";

// Log Levels Map
const LEVELS = {
    DEBUG:   0,
    INFO:    1,
    SUCCESS: 2,
    WARN:    3,
    ERROR:   4,
};

// Set active level depending on environment
const CURRENT_LEVEL = config.env === "production" ? LEVELS.INFO : LEVELS.DEBUG;

/**
 * Formats a log line consistently.
 */
const formatLog = (levelIcon, levelName, jobIdOrMsg, msg) => {
    const timestamp = new Date().toISOString();
    let jobId = "";
    let message = jobIdOrMsg;

    // Overload support: logger.info("General message") vs logger.info("job-123", "Job message")
    if (msg !== undefined) {
        jobId = ` [Job ${jobIdOrMsg}]`;
        message = msg;
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