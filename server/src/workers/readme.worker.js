import { Worker } from "bullmq";
import connection from "../queue/connection.js";

const readmeWorker = new Worker(
    "readme-generation",

    async (job) => {

        console.log("================================");
        console.log("📦 Processing Job");
        console.log(job.data);
        console.log("================================");

    },

    {
        connection,
    }
);

export default readmeWorker;