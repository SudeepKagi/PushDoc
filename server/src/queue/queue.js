import { Queue } from "bullmq";
import { getRedisOptions } from "./connection.js";
import { config } from "../config/app.config.js";

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

export default readmeQueue;