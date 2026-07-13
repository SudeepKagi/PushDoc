import { Worker } from "bullmq";
import connection from "../queue/connection.js";

import * as jobService from "../services/job.service.js";
import * as repositoryService from "../services/repository.service.js";
import * as githubService from "../services/github.service.js";
import * as gitService from "../services/git.service.js";
import * as readmePipeline from "../pipelines/readme.pipeline.js";
import * as readmeService from "../services/readme.service.js";
import * as logger from "../services/logger.service.js";
import * as workspaceService from "../services/workspace.service.js";
import * as readmeValidator from "../validators/readme.validator.js";
import { ValidationError } from "../utils/errors.js";

const readmeWorker = new Worker(
    "readme-generation",

    async (job) => {

        const jobId = job.id.toString();

        let trackingJob;
        let workspacePath;
        let repositoryPath;

        try {

            const {
                repositoryId,
                branch,
                commitSha,
            } = job.data;

            logger.divider();

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

            trackingJob =
                await jobService.createJob({
                    repository: repository._id,
                    bullJobId: jobId,
                    commitSha,
                    branch,
                });

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
                token
            );

            logger.success(
                jobId,
                "Repository cloned"
            );

            await jobService.updateStatus(
                trackingJob._id,
                "READING"
            );

            const { readme, knowledge } =
                await readmePipeline.generateReadme(
                    repositoryPath,
                    jobId
                );

            logger.success(
                jobId,
                "README generated"
            );

            // Run structural and semantic validation
            const validation =
                readmeValidator.validateReadme(
                    readme,
                    knowledge
                );

            logger.info(
                jobId,
                `README Validation Score: ${validation.score}/100 (Valid: ${validation.valid})`
            );

            if (!validation.valid) {
                logger.warn(
                    jobId,
                    "README validation did not reach score 90. Warnings:"
                );
                for (const w of validation.warnings) {
                    logger.warn(
                        jobId,
                        `  - ${w}`
                    );
                }
            }

            await jobService.updateStatus(
                trackingJob._id,
                "WRITING"
            );

            await readmeService.writeReadme(
                repositoryPath,
                readme
            );

            logger.success(
                jobId,
                "README written"
            );

            await jobService.updateStatus(
                trackingJob._id,
                "COMMITTING"
            );

            const committed =
                await gitService.commitChanges(
                    repositoryPath
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

                await gitService.pushChanges(
                    repositoryPath,
                    branch
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

            await jobService.completeJob(
                trackingJob._id
            );

            logger.success(
                jobId,
                "Job completed"
            );

        } catch (err) {

            if (trackingJob) {

                await jobService.failJob(
                    trackingJob._id,
                    err.message
                );

            }

            logger.error(
                jobId,
                err.message
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
        connection,
    }
);

export default readmeWorker;