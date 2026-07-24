import express from "express"
import redisConnection from "../queue/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let redisStatus = "ok";
    try {
        // Use a short timeout so a mid-reconnect Redis never delays the health check.
        // Render hits this endpoint at boot to verify the service is alive — if Redis
        // is still warming up, we report degraded rather than hanging or erroring.
        await Promise.race([
            redisConnection.ping(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("ping timeout")), 2_000)
            ),
        ]);
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