const express = require("express");
const morgan = require("morgan");
const indexRouter = require("./routes");
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/", indexRouter);

module.exports = app;