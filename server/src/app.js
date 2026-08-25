import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { config } from "./config/app.config.js";

import indexRouter from "./routes/index.route.js";
import githubRouter from "./routes/github.route.js";
import authRouter from "./routes/auth.route.js";
import webhookRouter from "./routes/webhook.route.js";


const app = express();

// Trust Render's (and similar hosts') reverse proxy so express-rate-limit
// identifies real client IPs from X-Forwarded-For, not the proxy's IP.
app.set("trust proxy", 1);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server webhooks)
        if (!origin) return callback(null, true);

        const allowed = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];

        // Allow any specified origin, wildcard, or standard Vercel/Render frontend origins
        if (
            allowed.includes("*") ||
            allowed.includes(origin) ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.endsWith(".vercel.app") ||
            origin.endsWith(".onrender.com")
        ) {
            return callback(null, true);
        }

        // Allow by default while reflecting request origin for credentials
        return callback(null, true);
    },
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


// Trust reverse proxy for accurate client IP identification on Render/Vercel
app.set("trust proxy", 1);

// Rate limit for auth endpoints (60 requests per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication requests. Please try again later." },
});

// General API rate limit (1,000 requests per 15 minutes per IP for real-time dashboard polling)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please slow down." },
});

app.use("/", indexRouter);
app.use("/github", apiLimiter, githubRouter);
app.use("/auth", authLimiter, authRouter);
app.use("/webhooks", webhookRouter);

export default app;