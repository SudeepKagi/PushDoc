import mongoose from "mongoose";
import { config } from "./app.config.js";
import * as logger from "../services/logger.service.js";
import { DatabaseError } from "../utils/errors.js";

const connectDB = async () => {
    try {
        if (!config.mongodb.uri) {
            throw new DatabaseError("MongoDB URI is not configured");
        }
        await mongoose.connect(config.mongodb.uri);
        logger.success("MongoDB connected successfully");
    }
    catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        throw new DatabaseError(`Database connection error: ${error.message}`);
    }
}

export default connectDB;