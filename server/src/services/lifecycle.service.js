import * as logger from "./logger.service.js";

/**
 * LifecycleManager
 * 
 * Production-grade server lifecycle and graceful shutdown coordinator.
 * - Manages server readiness state (INITIALIZING | READY | SHUTTING_DOWN | TERMINATED)
 * - Exposes /health dynamic health-check handler for load balancers (returns 503 during shutdown)
 * - Tracks active in-flight asynchronous tasks (e.g. LLM synthesis jobs)
 * - Executes pluggable cleanup hooks (DB disconnect, Worker close, Redis shutdown)
 * - Handles OS signals (SIGTERM, SIGINT) with dead-man's switch fallback timeout
 */
export class LifecycleManager {
    constructor(options = {}) {
        this.timeoutMs = options.timeoutMs || 10_000;
        this.state = "INITIALIZING"; // INITIALIZING | READY | SHUTTING_DOWN | TERMINATED
        this.activeTasks = new Set();
        this.cleanupHooks = [];
        this.isShuttingDown = false;
    }

    /**
     * Mark the server as ready to receive traffic.
     */
    setReady() {
        this.state = "READY";
        logger.info("Lifecycle: Server marked as READY");
    }

    /**
     * Express middleware for /health and /ready endpoints
     * Used by Kubernetes, AWS ALB, Render to check container health.
     */
    healthCheck = (req, res) => {
        if (this.state === "READY") {
            return res.status(200).json({
                status: "ok",
                state: this.state,
                uptime: Math.floor(process.uptime()),
                activeTasks: this.activeTasks.size,
                timestamp: new Date().toISOString(),
            });
        }

        // Return 503 when initializing or during shutdown
        return res.status(503).json({
            status: "unavailable",
            state: this.state,
            activeTasks: this.activeTasks.size,
            message: "Server is not accepting traffic",
        });
    };

    /**
     * Register an async cleanup function (DB disconnect, Queue stop, etc.)
     * @param {string} name - Descriptive name for the hook
     * @param {Function} hookFn - Async function returning a promise
     */
    addCleanupHook(name, hookFn) {
        this.cleanupHooks.push({ name, hookFn });
    }

    /**
     * Track in-flight async background tasks (e.g. LLM synthesis, cloning)
     * @param {string} name - Identifier for the task
     * @param {Promise} taskPromise - The Promise to track
     */
    trackTask(name, taskPromise) {
        if (!taskPromise || typeof taskPromise.finally !== "function") {
            return taskPromise;
        }

        const taskEntry = { name, promise: taskPromise, startedAt: Date.now() };
        this.activeTasks.add(taskPromise);

        logger.debug(`Task [${name}] started. Total active: ${this.activeTasks.size}`);

        taskPromise.finally(() => {
            this.activeTasks.delete(taskPromise);
            const duration = Date.now() - taskEntry.startedAt;
            logger.debug(`Task [${name}] finished in ${duration}ms. Active: ${this.activeTasks.size}`);
        });

        return taskPromise;
    }

    /**
     * Coordinate the Graceful Shutdown sequence
     * @param {string} signal - Signal name (e.g., 'SIGTERM', 'SIGINT')
     * @param {import('http').Server} [server] - Node HTTP server instance
     */
    async shutdown(signal, server) {
        // Idempotency: Prevent running shutdown twice if multiple signals arrive
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;
        this.state = "SHUTTING_DOWN";

        logger.info(`${signal} received — starting graceful shutdown sequence...`);

        // 1. Safety Dead-man's switch: Force-exit if stuck past timeout
        const forceKillTimer = setTimeout(() => {
            logger.error(`Forced shutdown triggered: Cleanup exceeded ${this.timeoutMs}ms limit.`);
            process.exit(1);
        }, this.timeoutMs);

        // unref() ensures this timer alone won't keep the event loop alive
        if (forceKillTimer.unref) forceKillTimer.unref();

        try {
            // 2. Stop accepting new HTTP requests (healthCheck immediately returns 503)
            if (server) {
                await new Promise((resolve) => {
                    server.close((err) => {
                        if (err) logger.error(`Error closing HTTP server: ${err.message}`);
                        else logger.info("HTTP server closed (no longer accepting connections)");
                        resolve();
                    });
                });
            }

            // 3. Wait for all in-flight tracked tasks to complete
            if (this.activeTasks.size > 0) {
                logger.info(`Waiting for ${this.activeTasks.size} in-flight task(s) to finish...`);
                await Promise.allSettled(Array.from(this.activeTasks));
                logger.info("All in-flight background tasks settled");
            }

            // 4. Run all registered cleanup hooks (DB, Redis, Worker)
            if (this.cleanupHooks.length > 0) {
                logger.info(`Running ${this.cleanupHooks.length} cleanup hook(s)...`);
                for (const { name, hookFn } of this.cleanupHooks) {
                    try {
                        logger.info(`Cleaning up: ${name}...`);
                        await hookFn();
                        logger.success(`${name} cleaned up successfully`);
                    } catch (err) {
                        // Isolate errors: one failure shouldn't prevent other cleanups
                        logger.error(`Cleanup failed for [${name}]: ${err.message}`);
                    }
                }
            }

            this.state = "TERMINATED";
            logger.success("Graceful shutdown completed cleanly. Exiting.");
            process.exit(0);

        } catch (err) {
            logger.error(`Fatal error during shutdown: ${err.message}`);
            process.exit(1);
        }
    }

    /**
     * Attach OS signal listeners
     * @param {import('http').Server} server - Node HTTP server instance
     */
    initSignalHandlers(server) {
        process.on("SIGTERM", () => this.shutdown("SIGTERM", server));
        process.on("SIGINT", () => this.shutdown("SIGINT", server));
    }
}

// Export singleton instance
export const lifecycle = new LifecycleManager({ timeoutMs: 10_000 });
export default lifecycle;
