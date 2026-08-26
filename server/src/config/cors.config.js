import { config } from "./app.config.js";

export const getAllowedOrigins = () => {
    const origins = Array.isArray(config.cors.origin)
        ? config.cors.origin
        : [config.cors.origin];

    return new Set(origins.filter(Boolean));
};

export const isAllowedOrigin = (origin) => Boolean(origin) && getAllowedOrigins().has(origin);

const corsError = (origin) => {
    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.status = 403;
    return error;
};

export const corsOptions = {
    origin: (origin, callback) => {
        // Non-browser clients and GitHub webhooks do not send an Origin header.
        if (!origin || isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(corsError(origin), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
};
