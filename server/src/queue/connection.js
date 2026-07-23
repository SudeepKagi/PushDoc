import IORedis from "ioredis";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

/**
 * Returns the base IORedis options suitable for BullMQ and cloud Redis.
 *
 * BullMQ requires separate IORedis instances for Queue vs Worker —
 * sharing one causes blocking-mode conflicts and ECONNRESET storms.
 *
 * Cloud Redis (Upstash free tier) drops idle TCP connections, so
 * enableReadyCheck must be false and a retryStrategy is required.
 */
function getRedisOptions() {
    const opts = {
        maxRetriesPerRequest: null,   // BullMQ requirement
        enableReadyCheck: false,      // Required for Upstash / cloud Redis
        retryStrategy: (times) => Math.min(times * 200, 5_000),
    };

    // TLS required for rediss:// URLs (Upstash, Redis Cloud)
    if (config.redis.url && config.redis.url.startsWith("rediss://")) {
        opts.tls = { rejectUnauthorized: false };
    }

    return opts;
}

/**
 * Creates a fresh IORedis connection.
 * Call this once per BullMQ consumer (Queue, Worker, QueueEvents).
 */
export function createConnection() {
    const conn = config.redis.url
        ? new IORedis(config.redis.url, getRedisOptions())
        : new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            ...getRedisOptions(),
        });

    conn.on("connect", () => logger.success("Redis Connected"));
    conn.on("error",   (err) => logger.error(`Redis Error: ${err.message}`));

    return conn;
}

export default createConnection;