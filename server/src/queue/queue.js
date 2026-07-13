import { Queue } from "bullmq";
import connection from "./connection.js";
import { config } from "../config/app.config.js";

const readmeQueue = new Queue(
    config.queue.name,
    {
        connection,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: config.queue.attempts,
            backoff: config.queue.backoff,
        },
    }
);

export default readmeQueue;