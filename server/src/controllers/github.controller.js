import * as githubService from "../services/github.service.js";
import * as authService from "../services/auth.service.js";
import * as installationStateService from "../services/installationState.service.js";
import * as installationService from "../services/installation.service.js";
import * as repositoryService from "../services/repository.service.js";
import * as jobService from "../services/job.service.js";
import * as logger from "../services/logger.service.js";
import readmeQueue from "../queue/queue.js";
import fs from "fs";
import path from "path";

export const getGitHubApp = async (req, res) => {
    try {
        await githubService.getGitHubApp();

        res.status(200).json({
            success: true,
            message: "GitHub App initialized successfully",
        });

    } catch (error) {

        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }
};

export const githubCallback = async (req, res) => {

    try {
        const { code } = req.query;
        const user = await authService.githubCallback(code);
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
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

        logger.info(`Creating GitHub app installation state for user ${req.user.userId}: ${state}`);

        const url = githubService.getInstallUrl(state);

        logger.info(`Redirecting user to GitHub installation URL`);

        return res.redirect(url);

    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }

};

export const installCallback = async (req, res) => {
    logger.info("GitHub App installation callback endpoint invoked");

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

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
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

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }

};

export const getJobs = async (req, res) => {
    try {
        const installation = await installationService.getInstallationByUser(req.user.userId);
        if (!installation) {
            return res.status(200).json({ success: true, jobs: [] });
        }

        const jobs = await jobService.getJobsByInstallation(installation._id);

        return res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getJobLogs = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await jobService.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const logFilePath = path.join("temp", "logs", `${job.bullJobId}.log`);
        let logLines = [];

        if (fs.existsSync(logFilePath)) {
            const rawContent = fs.readFileSync(logFilePath, "utf8");
            const lines = rawContent.split("\n").filter(Boolean);
            logLines = lines.map(line => {
                const match = line.match(/^\[([^\]]+)\](?:\s+\[Job\s+[^\]]+\])?\s+([^\s]+)\s+([A-Z]+):\s+(.*)$/);
                if (match) {
                    return {
                        time: match[1].substring(11, 19),
                        type: match[3],
                        text: match[4]
                    };
                }
                return {
                    time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
                    type: "INFO",
                    text: line
                };
            });
        }

        return res.status(200).json({
            success: true,
            hasLogs: logLines.length > 0,
            logs: logLines
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const triggerManualBuild = async (req, res) => {
    try {
        const { repoId } = req.params;
        const installation = await installationService.getInstallationByUser(req.user.userId);
        if (!installation) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: No GitHub App installation found for your user account"
            });
        }

        const repository = await repositoryService.getRepositoryById(repoId);
        if (!repository) {
            return res.status(404).json({
                success: false,
                message: "Repository not found"
            });
        }

        if (repository.installation.toString() !== installation._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You do not have permission to trigger verification for this repository"
            });
        }

        const { branch, commitSha } = await githubService.getRepositoryDefaultBranchAndCommit(
            installation.installationId,
            repository.owner,
            repository.name
        );

        const job = await readmeQueue.add(
            "generate-readme",
            {
                repositoryId: repository.githubId,
                branch,
                commitSha,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
            }
        );

        logger.success(`Manual README generation job queued for ${repository.fullName} (Job ID: ${job.id})`);

        return res.status(200).json({
            success: true,
            message: "Verification job successfully queued",
            jobId: job.id,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};