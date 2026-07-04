import { Worker } from "bullmq";

import connection from "../queue/connection.js";

import * as repositoryService from "../services/repository.service.js";
import * as githubService from "../services/github.service.js";
import * as gitService from "../services/git.service.js";
import * as readmePipeline from "../pipelines/readme.pipeline.js";
import * as readmeService from "../services/readme.service.js";
import * as logger from "../services/logger.service.js";

const readmeWorker = new Worker(
    "readme-generation",

    async (job) => {

        const jobId = job.id;

        try {

            const {
                repositoryId,
                branch,
                commitSha,
            } = job.data;

            logger.divider();

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
                throw new Error(
                    "Repository not found"
                );
            }

            logger.info(
                jobId,
                `Repository: ${repository.fullName}`
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

            const repositoryPath =
                await gitService.cloneRepository(
                    authenticatedCloneUrl,
                    repository.name
                );

            logger.success(
                jobId,
                "Repository cloned"
            );

            const readme =
                await readmePipeline.generateReadme(
                    repositoryPath
                );

            logger.success(
                jobId,
                "README generated"
            );

            await readmeService.writeReadme(
                repositoryPath,
                readme
            );

            logger.success(
                jobId,
                "README written"
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

            logger.divider();

        } catch (err) {

            logger.error(
                jobId,
                err.message
            );

            throw err;

        }

    },

    {
        connection,
    }
);

export default readmeWorker;