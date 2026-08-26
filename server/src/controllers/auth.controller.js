import * as authService from "../services/auth.service.js";
import * as logger from "../services/logger.service.js";
import { ValidationError } from "../utils/errors.js";
import { config } from "../config/app.config.js";
import { publicErrorMessage } from "../utils/http-response.js";

export const githubLogin = async (req, res) => {
    try {
        const githubAuthURL = await authService.githubLogin();
        return res.redirect(githubAuthURL);
    }
    catch (error) {
        logger.error(null, `githubLogin error: ${error.message}`);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: publicErrorMessage(error, statusCode),
        });
    }
};

export const githubCallback = async (req, res) => {

    try {

        const { code, state } = req.query;

        if (!code) {
            throw new ValidationError("GitHub OAuth authorization code is missing from callback query parameters");
        }

        const result = await authService.githubCallback(code, state);

        // Set secure HttpOnly cookie for transparent, XSS-safe authentication
        res.cookie("auth_token", result.token, {
            httpOnly: true,
            secure: config.env === "production",
            sameSite: config.env === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Pass token in redirect URL for cross-origin deployments (e.g. Vercel frontend + Render backend)
        // where modern privacy browsers (Brave Shields, Safari ITP, Firefox, Chrome Privacy Sandbox) block cross-site cookies
        const frontendUrl = `${config.frontend.url}/?token=${result.token}&username=${encodeURIComponent(result.user.username)}&avatarUrl=${encodeURIComponent(result.user.avatarUrl || '')}`;
        return res.redirect(frontendUrl);

    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: publicErrorMessage(error, statusCode),
        });

    }

};

export const getMe = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        logger.error(null, `getMe error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user details",
        });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "lax",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
