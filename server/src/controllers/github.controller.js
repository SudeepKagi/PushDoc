import * as githubService from "../services/github.service.js";

export const getGitHubApp = async (req, res) => {
    try {
        await githubService.getGitHubApp();

        res.status(200).json({
            success: true,
            message: "GitHub App initialized successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const githubCallback = async (req, res) => {

    try {
        const { code } = req.query;
        const user = authServic.githubCallback(code);
        return res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};