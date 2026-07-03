import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import "./src/queue/connection.js";
import "./src/workers/readme.worker.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});