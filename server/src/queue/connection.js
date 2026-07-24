import IORedis from "ioredis";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

/**
 * Returns a plain connection-options object for BullMQ to consume.
 *
 * Passing raw options (instead of an IORedis instance) prevents BullMQ
 * from calling .duplicate() on our instance — which was creating 8+
 * connections at startup and triggering the Upstash ECONNRESET storm.
 *
 * Upstash free tier drops idle TCP connections quickly; the retryStrategy
 * here ensures IORedis reconnects silently without crashing.
 */
export function getRedisOptions() {
    const base = {
        maxRetriesPerRequest: null,   // BullMQ requirement
        enableReadyCheck: false,      // Required for Upstash / cloud Redis
        keepAlive: 5_000,             // Send TCP keepalive probes every 5s — prevents Upstash proxy from silently dropping idle sockets
        retryStrategy: (times) => Math.min(times * 200, 5_000),
    };

    if (config.redis.url) {
        try {
            const parsed = new URL(config.redis.url);
            return {
                ...base,
                host: parsed.hostname,
                port: parseInt(parsed.port || "6379", 10),
                password: parsed.password || undefined,
                ...(config.redis.url.startsWith("rediss://")
                    ? { tls: { rejectUnauthorized: false } }
                    : {}),
            };
        } catch {
            // Fallback: pass URL string directly (older ioredis versions)
            return { ...base };
        }
    }

    return {
        ...base,
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    };
}

/**
 * Creates a single monitored IORedis connection for app-level usage (OAuth state storage, health logging).
 */
export function createMonitoringConnection() {
    const opts = {
        ...getRedisOptions(),
        // Override BullMQ's "retry forever" setting — this connection is used
        // for HTTP-facing operations (OAuth state storage) and must fail fast
        // so a mid-reconnect Redis call never hangs an Express response indefinitely.
        maxRetriesPerRequest: 3,
        // Don't open a socket at import time — BullMQ opens 3 connections
        // simultaneously at boot (Queue command, Worker command, Worker blocking).
        // Upstash free tier struggles with that burst; staggering by 1.5s lets
        // BullMQ's connections stabilise first and eliminates the startup
        // "Reached max retries" noise on the monitoring connection.
        lazyConnect: true,
    };

    const conn = config.redis.url && !opts.host
        ? new IORedis(config.redis.url, opts)
        : new IORedis(opts);

    // ── Diagnostic lifecycle listeners ───────────────────────────────────────
    // "connect"     = TCP socket opened (auth/TLS not yet complete)
    // "ready"       = AUTH + SELECT finished — commands can actually run
    // "close"       = socket closed (Upstash idle-drop or network issue)
    // "reconnecting"= ioredis is waiting before the next retry attempt
    // "end"         = ioredis gave up entirely (retryStrategy returned false/null)
    conn.on("connect",     ()      => logger.info("Redis: socket connected"));
    conn.on("ready",       ()      => logger.success("Redis: ready (auth complete)"));
    conn.on("close",       ()      => logger.warn("Redis: connection closed"));
    conn.on("reconnecting",(delay) => logger.warn(`Redis: reconnecting in ${delay}ms`));
    conn.on("end",         ()      => logger.error("Redis: connection ended — ioredis gave up"));
    conn.on("error", (err) => {
        // ECONNRESET / EPIPE are expected when Upstash/cloud Redis drops idle connections.
        // IORedis auto-reconnects — suppress to avoid log spam.
        if (err.code !== "ECONNRESET" && err.code !== "EPIPE") {
            logger.error(`Redis Error: ${err.message}`);
        }
    });

    // Stagger the initial connect so it doesn't race BullMQ's 3 connections.
    // Any command issued before this resolves will queue internally and execute
    // once the connection is established (lazyConnect doesn't drop commands).
    setTimeout(() => conn.connect().catch(() => {}), 1_500);

    return conn;
}

// Single instance for general app use (e.g. auth service storing OAuth state)
const connection = createMonitoringConnection();
export default connection;