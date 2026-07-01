import * as githubService from "../services/github.service.js";
import * as installationStateService from "../services/installationState.service.js";
import * as installationService from "../services/installation.service.js";

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

export const installApp = async (req, res) => {

    try {

        const state = await installationStateService.createState(
            req.user.userId
        );

        const url = githubService.getInstallUrl(state);

        return res.redirect(url);

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

export const installCallback = async (req, res) => {

    try {

        const { installation_id, state } = req.query;

        const savedState =
            await installationStateService.getState(state);

        if (!savedState) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired state",
            });
        }

        const installationDetails =
            await githubService.getInstallation(
                installation_id
            );

        const installation =
            await installationService.createOrUpdateInstallation(
                installationDetails,
                savedState.user._id
            );

        await installationStateService.deleteState(state);

        return res.status(200).json({
            success: true,
            installation,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};