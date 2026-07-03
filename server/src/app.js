import express from "express";
import morgan from "morgan";

import indexRouter from "./routes/index.js";
import githubRouter from "./routes/github.js";
import authRouter from "./routes/auth.js";
import webhookRouter from "./routes/webhook.js";


const app = express();

app.use(
    express.json({
        verify: (req, res, buffer) => {
            req.rawBody = buffer;
        },
    })
);
app.use(morgan("dev"));

app.use("/", indexRouter);
app.use("/github", githubRouter);
app.use("/auth", authRouter);
app.use("/webhooks", webhookRouter);

export default app;