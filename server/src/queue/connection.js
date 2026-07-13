import IORedis from "ioredis";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

const connection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
});

connection.on("connect", () => {
    logger.success("Redis Connected");
});

connection.on("error", (error) => {
    logger.error(`Redis Error: ${error.message}`);
});

export default connection;