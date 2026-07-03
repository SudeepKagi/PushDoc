import { Queue } from "bullmq";
import connection from "./connection.js";

const readmeQueue = new Queue(
    "readme-generation",
    {
        connection,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
        },
    }
);

export default readmeQueue;