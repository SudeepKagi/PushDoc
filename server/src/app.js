import express from "express";
import morgan from "morgan";

import indexRouter from "./routes/index.js";
import githubRouter from "./routes/github.js";
import authRouter from "./routes/auth.js";


const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/", indexRouter);
app.use("/github", githubRouter);
app.use("/auth", authRouter);

export default app;