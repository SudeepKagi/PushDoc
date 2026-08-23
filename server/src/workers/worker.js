/**
 * Standalone worker entry point.
 *
 * Run this as a separate process from the web server:
 *   npm run worker          (production)
 *   npm run worker:dev      (development, with nodemon)
 *
 * This process only runs the BullMQ worker — it does not start an HTTP server.
 * Keeping web and worker separate means a crashed worker doesn't take down
 * the web process, and they don't compete for the same Redis connections.
 */

import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/database.js";
import * as logger from "../services/logger.service.js";
import { validateConfig } from "../config/app.config.js";

// Validate required env vars before doing anything
try {
    validateConfig();
    logger.info("Worker: configuration validated");
} catch (err) {
    logger.error(`Worker startup failed: ${err.message}`);
    process.exit(1);
}

// Connect to MongoDB (worker needs it for job status updates)
try {
    await connectDB();
    logger.info("Worker: MongoDB connected");
} catch (err) {
    logger.error(`Worker: MongoDB connection failed: ${err.message}`);
    process.exit(1);
}

// Register the BullMQ worker. This import starts listening for queued jobs.
import "./readme.worker.js";

logger.success("Worker process started and listening for jobs");

// ── Graceful shutdown ──────────────────────────────────────────────────────
// When the process receives SIGTERM (e.g. from a process manager or container
// orchestrator), close the worker cleanly so in-flight jobs are not abandoned.
process.on("SIGTERM", () => {
    logger.info("Worker: SIGTERM received — shutting down gracefully");
    // readme.worker.js exports the Worker instance; give BullMQ a chance to
    // finish the current job before exiting.
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("Worker: SIGINT received — shutting down gracefully");
    process.exit(0);
});

process.on("unhandledRejection", (reason) => {
    logger.error(`Worker unhandled rejection: ${reason}`);
});

process.on("uncaughtException", (err) => {
    logger.error(`Worker uncaught exception: ${err.message}`);
    process.exit(1);
});
