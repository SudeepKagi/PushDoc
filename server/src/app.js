import express from "express";
import morgan from "morgan";

import indexRouter from "./routes/index.js";
import githubRouter from "./routes/github.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/", indexRouter);
app.use("/github", githubRouter);

export default app;