import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB, { disconnectDB } from "./src/config/database.js";
import { config, validateConfig } from "./src/config/app.config.js";
import * as logger from "./src/services/logger.service.js";
import { purgeStaleWorkspaces } from "./src/services/workspace.service.js";
import { reapStaleJobs } from "./src/services/job.service.js";
import { lifecycle } from "./src/services/lifecycle.service.js";
dotenv.config();

// Support embedded worker for single-instance cloud deployments (Render, Railway, Fly, Local)
const separateWorker = ["true", "1", "yes"].includes(
    (process.env.SEPARATE_WORKER || "").toLowerCase().trim()
);
logger.info(`Worker mode: ${separateWorker ? "separate (dedicated worker process expected)" : "embedded (running in this web process)"}`);

if (!separateWorker) {
    import("./src/workers/readme.worker.js")
        .then(() => logger.info("Embedded README worker initialized in-process"))
        .catch(err => logger.error(`Failed to start embedded worker: ${err.message}`));
}

// Validate environment variables before initializing the server
try {
    validateConfig();
    logger.info("Configuration validated successfully");
} catch (err) {
    logger.error(`Startup validation failed: ${err.message}`);
    process.exit(1);
}

const PORT = config.port;

const startServer = async () => {
    try {
        await connectDB();

        // Register database cleanup hook for graceful shutdown
        lifecycle.addCleanupHook("MongoDB Connection", disconnectDB);

        // Clean up any workspaces left over from an unclean shutdown
        purgeStaleWorkspaces();

        // Start background stale job reaper (auto-fails jobs stuck in QUEUED or hung states)
        reapStaleJobs();
        const reaperInterval = setInterval(reapStaleJobs, 30_000);
        lifecycle.addCleanupHook("Job Reaper Interval", () => clearInterval(reaperInterval));

        const server = app.listen(PORT, "0.0.0.0", () => {
            lifecycle.setReady();
            logger.success(`Server running in ${config.env} mode on port ${PORT}`);
        });

        // ── Graceful shutdown via LifecycleManager ───────────────
        lifecycle.initSignalHandlers(server);

        // ── Unhandled rejection guard ────────────────────────────
        process.on("unhandledRejection", (reason) => {
            logger.error(`Unhandled Promise Rejection: ${reason}`);
        });

        process.on("uncaughtException", (err) => {
            logger.error(`Uncaught Exception: ${err.message}`);
            process.exit(1);
        });

    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
};

startServer();