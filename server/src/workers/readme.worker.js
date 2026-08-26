import { Worker } from "bullmq";
import { getRedisOptions } from "../queue/connection.js";
import path from "path";
import fs from "fs";

import * as jobService from "../services/job.service.js";
import * as repositoryService from "../services/repository.service.js";
import * as githubService from "../services/github.service.js";
import * as gitService from "../services/git.service.js";
import * as readmePipeline from "../pipelines/readme.pipeline.js";
import * as readmeService from "../services/readme.service.js";
import * as logger from "../services/logger.service.js";
import * as workspaceService from "../services/workspace.service.js";
import { ValidationError } from "../utils/errors.js";
import { lifecycle } from "../services/lifecycle.service.js";

const isJobCancelled = async (trackingJobId) => {
    if (!trackingJobId) return false;
    try {
        const job = await jobService.getJobById(trackingJobId);
        return job?.status === "CANCELLED";
    } catch {
        return false;
    }
};

const readmeWorker = new Worker(
    "readme-generation",

    async (job) => {

        const jobId = job.id.toString();

        let trackingJob;
        let workspacePath;
        let repositoryPath;
        let originalReadme = "";
        let generatedReadme = "";

        const {
            repositoryId,
            branch,
            commitSha,
            trackingJobId,
        } = job.data || {};

        try {
            logger.divider();

            if (trackingJobId) {
                try {
                    trackingJob = await jobService.getJobById(trackingJobId);
                } catch {
                    // Continue
                }
            }

            if (trackingJob && await isJobCancelled(trackingJob._id)) {
                logger.info(jobId, "Job cancelled before execution started — aborting.");
                return;
            }

            if (!repositoryId || !branch || !commitSha) {
                throw new ValidationError(
                    "Corrupted job payload: repositoryId, branch, and commitSha are required"
                );
            }

            logger.info(
                jobId,
                `Repository ID: ${repositoryId}`
            );

            logger.info(
                jobId,
                `Branch: ${branch}`
            );

            logger.info(
                jobId,
                `Commit: ${commitSha}`
            );

            const repository =
                await repositoryService.getRepositoryByGithubId(
                    repositoryId
                );

            if (!repository) {
                throw new ValidationError(
                    `Repository not found in local database for GitHub ID: ${repositoryId}`
                );
            }

            logger.info(
                jobId,
                `Repository: ${repository.fullName}`
            );

            if (!trackingJob) {
                trackingJob =
                    await jobService.createJob({
                        repository: repository._id,
                        bullJobId: jobId,
                        commitSha,
                        branch,
                    });
            }

            await jobService.updateStatus(
                trackingJob._id,
                "CLONING"
            );

            const token =
                await githubService.getInstallationAccessToken(
                    repository.installation.installationId
                );

            const authenticatedCloneUrl =
                gitService.createAuthenticatedCloneUrl(
                    repository.cloneUrl,
                    token
                );

            workspacePath =
                workspaceService.createWorkspace(
                    jobId
                );
            // Hard security ceiling: auto-delete workspace if job exceeds 10 minutes
            workspaceService.setWorkspaceTimeout(
                jobId,
                10 * 60 * 1000
            );

            logger.info(
                jobId,
                `Workspace: ${workspacePath}`
            );

            repositoryPath =
                workspaceService.getRepositoryPath(
                    jobId,
                    repository.name
                );

            await gitService.cloneRepository(
                authenticatedCloneUrl,
                repositoryPath,
                token,
                branch
            );

            logger.success(
                jobId,
                "Repository cloned"
            );

            if (await isJobCancelled(trackingJob._id)) {
                logger.info(jobId, "Job cancelled by user — stopping pipeline after clone.");
                return;
            }

            // Capture original README text if it exists BEFORE writing anything new
            originalReadme = readmeService.readExistingReadme(repositoryPath);
            if (originalReadme) {
                logger.info(jobId, `Found existing repository README (${originalReadme.split('\n').length} lines)`);
            }

            await jobService.updateStatus(
                trackingJob._id,
                "READING"
            );

            await jobService.updateStatus(
                trackingJob._id,
                "GENERATING"
            );

            const { readme, knowledge, criticReport, structuralReport, metrics } =
                await readmePipeline.generateReadme(
                    repositoryPath,
                    jobId
                );

            const allWarnings = [
                ...(criticReport?.isClean === false
                    ? (criticReport.violations || []).map(v => `${v.type}: ${v.value}`)
                    : []),
                ...(structuralReport?.warnings || []),
            ];

            const lowestScore = Math.min(
                criticReport?.score ?? 100,
                structuralReport?.score ?? 100
            );

            // Inject Quality Badge into README below the primary title
            const badgeColor = lowestScore >= 90 ? "brightgreen" : lowestScore >= 75 ? "yellow" : "red";
            const qualityBadge = `[![PushDoc Quality Score](https://img.shields.io/badge/PushDoc%20Quality-${lowestScore}%2F100-${badgeColor})](https://github.com/SudeepKagi/PushDoc)`;

            let finalReadme = readme;
            if (!finalReadme.includes("PushDoc%20Quality")) {
                const lines = finalReadme.split("\n");
                const h1Index = lines.findIndex(line => line.startsWith("# "));
                if (h1Index !== -1) {
                    lines.splice(h1Index + 1, 0, "", qualityBadge);
                    finalReadme = lines.join("\n");
                } else {
                    finalReadme = `${qualityBadge}\n\n${finalReadme}`;
                }
            }

            generatedReadme = finalReadme;

            logger.success(
                jobId,
                `README generated (Quality: ${lowestScore}/100 | Critic: ${criticReport?.score ?? 100} | Structural: ${structuralReport?.score ?? 100} | Total: ${metrics?.TOTAL ?? 0}ms)`
            );

            if (await isJobCancelled(trackingJob._id)) {
                logger.info(jobId, "Job cancelled by user — stopping pipeline before write.");
                return;
            }

            await jobService.updateStatus(
                trackingJob._id,
                "WRITING"
            );

            const { readmePath, filename } = await readmeService.writeReadme(
                repositoryPath,
                finalReadme
            );

            logger.success(
                jobId,
                `README written to ${filename}`
            );

            await jobService.updateStatus(
                trackingJob._id,
                "COMMITTING"
            );

            const committed =
                await gitService.commitChanges(
                    repositoryPath,
                    token,
                    filename
                );

            if (committed) {

                logger.success(
                    jobId,
                    "README committed"
                );

                await jobService.updateStatus(
                    trackingJob._id,
                    "PUSHING"
                );

                // Fetch fresh token before push in case token expired during long generation (PD-13)
                const pushToken = await githubService.getInstallationAccessToken(
                    repository.installation.installationId
                ).catch(() => token);

                await gitService.pushChanges(
                    repositoryPath,
                    branch,
                    pushToken
                );

                logger.success(
                    jobId,
                    "README pushed"
                );

            } else {

                logger.info(
                    jobId,
                    "No changes to commit"
                );

            }

            if (await isJobCancelled(trackingJob._id)) {
                logger.info(jobId, "Job was marked cancelled — skipping completeJob.");
                return;
            }

            await jobService.completeJob(
                trackingJob._id,
                {
                    originalReadme,
                    generatedReadme,
                    validationWarnings: allWarnings,
                    validationScore: lowestScore,
                }
            );

            logger.success(
                jobId,
                "Job completed"
            );

        } catch (err) {
            const targetId = trackingJob?._id || trackingJobId;
            if (targetId) {
                try {
                    await jobService.failJob(
                        targetId,
                        err.message || "Synthesis pipeline execution error",
                        {
                            originalReadme,
                            generatedReadme,
                        }
                    );
                } catch (failErr) {
                    logger.error(jobId, `Failed to update job status to FAILED: ${failErr.message}`);
                }
            }

            logger.error(
                jobId,
                `Pipeline Error: ${err.message}`
            );

            throw err;

        } finally {

            // Always clean up the temp workspace regardless of success or failure
            try {
                workspaceService.cleanupWorkspace(jobId);
            } catch (cleanupErr) {
                logger.warn(jobId, `Workspace cleanup failed: ${cleanupErr.message}`);
            }

            logger.divider();

        }

    },

    {
        connection: getRedisOptions(),   // Raw options — BullMQ manages connections internally
        drainDelay: 5,                   // Check immediately (5s max when idle) so jobs start instantly
        stalledInterval: 30_000,         // Check stalled jobs every 30 seconds
        lockDuration: 300_000,           // 5-minute job lock duration
    }
);

// BullMQ re-emits internal IORedis errors through the Worker EventEmitter.
// Without this listener, Node throws on 'error' → uncaught exception → crash.
readmeWorker.on("error", (err) => {
    if (err.code !== "ECONNRESET" && err.code !== "EPIPE") {
        logger.error(`Worker Redis Error: ${err.message}`);
    }
});

// Register graceful worker cleanup with lifecycle manager
lifecycle.addCleanupHook("BullMQ Worker (readmeWorker)", async () => {
    await readmeWorker.close();
});

export default readmeWorker;