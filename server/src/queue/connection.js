import IORedis from "ioredis";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

/**
 * Creates a new IORedis connection.
 *
 * BullMQ requires a SEPARATE connection instance for each consumer
 * (Queue, Worker, QueueEvents). Sharing one connection causes it to
 * enter blocking mode for one consumer and break all others —
 * producing the ECONNRESET reconnection loop seen in Render logs.
 *
 * Cloud Redis providers (Upstash, Redis Cloud free tier) also drop
 * idle TCP connections, so enableReadyCheck:false + keepAlive are required.
 */
export function createConnection() {
    const baseOptions = {
        maxRetriesPerRequest: null,   // Required by BullMQ
        enableReadyCheck: false,      // Needed for Upstash / cloud Redis
        lazyConnect: false,
        keepAlive: 30000,             // TCP keepalive every 30s to prevent idle resets
        retryStrategy: (times) => {
            // Cap retry delay at 10s; IORedis handles reconnection automatically
            return Math.min(times * 500, 10_000);
        },
    };

    if (config.redis.url && config.redis.url.startsWith("rediss://")) {
        baseOptions.tls = { rejectUnauthorized: false };
    }

    const conn = config.redis.url
        ? new IORedis(config.redis.url, baseOptions)
        : new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            ...baseOptions,
        });

    conn.on("connect", () => logger.success("Redis Connected"));
    conn.on("error",   (err) => logger.error(`Redis Error: ${err.message}`));

    return conn;
}

// Default shared connection for simple use cases.
// Queue and Worker MUST call createConnection() to get their own instance.
const connection = createConnection();
export default connection;