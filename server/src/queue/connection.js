import IORedis from "ioredis";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

const redisOptions = {
    maxRetriesPerRequest: null,
};

if (config.redis.url && config.redis.url.startsWith("rediss://")) {
    redisOptions.tls = {
        rejectUnauthorized: false
    };
}

const connection = config.redis.url
    ? new IORedis(config.redis.url, redisOptions)
    : new IORedis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        ...redisOptions,
    });

connection.on("connect", () => {
    logger.success("Redis Connected");
});

connection.on("error", (error) => {
    logger.error(`Redis Error: ${error.message}`);
});

export default connection;