import * as authService from "../services/auth.service.js";

export const githubLogin = async (req, res) => {
    try {
        const githubAuthURL = authService.githubLogin();
        return res.redirect(githubAuthURL);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}