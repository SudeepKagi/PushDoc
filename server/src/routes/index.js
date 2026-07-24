import express from "express"
import redisConnection from "../queue/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let redisStatus = "ok";
    try {
        await redisConnection.ping();
    } catch {
        redisStatus = "degraded";
    }

    res.status(200).json({
        success: true,
        message: "PushDoc API is running 🚀",
        redis: redisStatus,
    });
});

export default router;