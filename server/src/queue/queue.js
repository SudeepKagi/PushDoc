import { Queue } from "bullmq";
import { createConnection } from "./connection.js";
import { config } from "../config/app.config.js";

// Queue needs its own dedicated connection — never share with Worker
const readmeQueue = new Queue(
    config.queue.name,
    {
        connection: createConnection(),
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: config.queue.attempts,
            backoff: config.queue.backoff,
        },
    }
);

export default readmeQueue;