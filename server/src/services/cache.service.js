/**
 * Cache Service
 *
 * A thin wrapper over the existing Redis connection that handles JSON
 * serialization/deserialization automatically. All code that needs to
 * cache values should use this module rather than calling ioredis directly,
 * so there is one consistent interface and one place to add error handling.
 *
 * The underlying connection is the same one used by BullMQ's queue — it is
 * already configured with TLS, retry strategy, and connection pooling.
 */

import redisConnection from "../queue/connection.js";
import * as logger from "./logger.service.js";

/**
 * Retrieve a cached value by key.
 *
 * @param {string} key - Redis key
 * @returns {Promise<any|null>} Parsed JSON value, or null if not found / on error
 */
export const get = async (key) => {
    try {
        const raw = await redisConnection.get(key);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch (err) {
        // A cache miss should never crash the caller — log and return null so
        // the caller falls back to the uncached code path.
        logger.warn(`Cache get failed for key "${key}": ${err.message}`);
        return null;
    }
};

/**
 * Store a value in the cache.
 *
 * @param {string} key - Redis key
 * @param {any} value - Value to store (will be JSON-serialized)
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @returns {Promise<void>}
 */
export const set = async (key, value, ttlSeconds) => {
    try {
        const serialized = JSON.stringify(value);
        await redisConnection.set(key, serialized, "EX", ttlSeconds);
    } catch (err) {
        // A write failure is non-fatal — the caller still has the value in memory.
        // Log it so we know Redis is degraded, but don't throw.
        logger.warn(`Cache set failed for key "${key}": ${err.message}`);
    }
};

/**
 * Delete a key from the cache.
 *
 * @param {string} key - Redis key
 * @returns {Promise<void>}
 */
export const del = async (key) => {
    try {
        await redisConnection.del(key);
    } catch (err) {
        logger.warn(`Cache del failed for key "${key}": ${err.message}`);
    }
};
