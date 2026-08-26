import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.config.js";
import { requireTrustedOriginForCookieSession } from "./middleware/csrf.middleware.js";

import indexRouter from "./routes/index.route.js";
import githubRouter from "./routes/github.route.js";
import authRouter from "./routes/auth.route.js";
import webhookRouter from "./routes/webhook.route.js";


const app = express();

// Trust Render's (and similar hosts') reverse proxy so express-rate-limit
// identifies real client IPs from X-Forwarded-For, not the proxy's IP.
app.set("trust proxy", 1);

app.use(cors(corsOptions));

app.use(cookieParser());
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
app.use("/github", apiLimiter, requireTrustedOriginForCookieSession, githubRouter);
app.use("/auth", authLimiter, requireTrustedOriginForCookieSession, authRouter);
app.use("/webhooks", webhookRouter);

export default app;
