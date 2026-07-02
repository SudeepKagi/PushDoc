import * as githubService from "../services/github.service.js";
import * as installationStateService from "../services/installationState.service.js";
import * as installationService from "../services/installation.service.js";
import * as repositoryService from "../services/repository.service.js";

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
        const user = await authServic.githubCallback(code);
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

        console.log("Creating state...");
        console.log("State:", state);

        const url = githubService.getInstallUrl(state);

        console.log("Redirect URL:", url);

        return res.redirect(url);

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

export const installCallback = async (req, res) => {
    console.log("INSTALL CALLBACK HIT");
    console.log(req.query);

    try {

        const { installation_id, state } = req.query;

        if (!installation_id || !state) {
            return res.status(400).json({
                success: false,
                message: "Missing installation_id or state",
            });
        }

        const savedState =
            await installationStateService.getState(state);

        if (!savedState) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired state",
            });
        }

        if (savedState.expiresAt < new Date()) {

            await installationStateService.deleteState(state);

            return res.status(400).json({
                success: false,
                message: "State expired",
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
export const syncRepositories = async (req, res) => {

    try {

        const installation =
            await installationService.getInstallationByUser(
                req.user.userId
            );

        if (!installation) {
            return res.status(404).json({
                success: false,
                message: "Installation not found",
            });
        }

        const repositories =
            await githubService.getInstallationRepositories(
                installation.installationId
            );

        const syncedRepositories = [];

        for (const repo of repositories) {

            const savedRepository =
                await repositoryService.createOrUpdateRepository(
                    repo,
                    installation._id
                );

            syncedRepositories.push(savedRepository);
        }

        return res.status(200).json({
            success: true,
            count: syncedRepositories.length,
            repositories: syncedRepositories,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};