import jwt from "jsonwebtoken";
import { config } from "../config/app.config.js";

export const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            provider: user.provider,
        },
        config.jwt.secret || process.env.JWT_SECRET,
        {
            expiresIn: config.jwt.expiresIn || "7d",
        }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret || process.env.JWT_SECRET);
};