import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { config } from "./config/app.config.js";

import indexRouter from "./routes/index.js";
import githubRouter from "./routes/github.js";
import authRouter from "./routes/auth.js";
import webhookRouter from "./routes/webhook.js";


const app = express();

// Trust Render's (and similar hosts') reverse proxy so express-rate-limit
// identifies real client IPs from X-Forwarded-For, not the proxy's IP.
app.set("trust proxy", 1);

app.use(cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(
    express.json({
        verify: (req, res, buffer) => {
            req.rawBody = buffer;
        },
    })
);
if (config.env !== "production") {
    app.use(morgan("dev"));
}


// Strict rate limit for auth endpoints (10 requests per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
});

// General API rate limit (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
});

app.use("/", indexRouter);
app.use("/github", apiLimiter, githubRouter);
app.use("/auth", authLimiter, authRouter);
app.use("/webhooks", webhookRouter);

export default app;