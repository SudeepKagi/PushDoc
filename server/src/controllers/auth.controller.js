import * as authService from "../services/auth.service.js";
import { ValidationError } from "../utils/errors.js";

export const githubLogin = async (req, res) => {
    try {
        const githubAuthURL = authService.githubLogin();
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

        const { code } = req.query;

        if (!code) {
            throw new ValidationError("GitHub OAuth authorization code is missing from callback query parameters");
        }

        const result = await authService.githubCallback(code);

        return res.status(200).json({
            success: true,
            user: result.user,
            token: result.token,
        });

    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }

};