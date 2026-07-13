import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { config, validateConfig } from "./src/config/app.config.js";
import * as logger from "./src/services/logger.service.js";
import "./src/queue/connection.js";
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
        app.listen(PORT, () => {
            logger.success(`Server running in ${config.env} mode on port ${PORT}`);
        });
    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
};

startServer();