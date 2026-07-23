import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { config, validateConfig } from "./src/config/app.config.js";
import * as logger from "./src/services/logger.service.js";
import { purgeStaleWorkspaces } from "./src/services/workspace.service.js";
import { createMonitoringConnection } from "./src/queue/connection.js";
import "./src/workers/readme.worker.js";

dotenv.config();

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

        // Clean up any workspaces left over from an unclean shutdown
        purgeStaleWorkspaces();

        const server = app.listen(PORT, () => {
            logger.success(`Server running in ${config.env} mode on port ${PORT}`);
            // Single monitored Redis connection for health visibility
            createMonitoringConnection();
        });

        // ── Graceful shutdown ────────────────────────────────────
        const shutdown = (signal) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(() => {
                logger.info("HTTP server closed");
                process.exit(0);
            });

            // Force-kill if server hasn't closed within 10 s
            setTimeout(() => {
                logger.error("Forced shutdown after timeout");
                process.exit(1);
            }, 10_000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT",  () => shutdown("SIGINT"));

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