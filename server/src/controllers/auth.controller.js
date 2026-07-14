import * as authService from "../services/auth.service.js";
import { ValidationError } from "../utils/errors.js";

export const githubLogin = async (req, res) => {
    try {
        const githubAuthURL = await authService.githubLogin();
        return res.redirect(githubAuthURL);
    }
    catch (error) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
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

        const frontendUrl = `http://localhost:1234/?token=${result.token}&username=${result.user.username}&avatarUrl=${encodeURIComponent(result.user.avatarUrl || '')}`;
        return res.redirect(frontendUrl);

    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }

};