import { Queue } from "bullmq";
import { getRedisOptions } from "./connection.js";
import { config } from "../config/app.config.js";
import * as logger from "../services/logger.service.js";

// Pass raw options — BullMQ manages its own IORedis instances internally.
// This prevents the .duplicate() chain that was creating 8+ connections.
const readmeQueue = new Queue(
    config.queue.name,
    {
        connection: getRedisOptions(),
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: config.queue.attempts,
            backoff: config.queue.backoff,
        },
    }
);

// BullMQ re-emits internal IORedis errors through the Queue EventEmitter.
// Without this listener, Node throws on 'error' → uncaught exception → crash.
readmeQueue.on("error", (err) => {
    if (err.code !== "ECONNRESET" && err.code !== "EPIPE") {
        logger.error(`Queue Redis Error: ${err.message}`);
    }
});

export default readmeQueue;