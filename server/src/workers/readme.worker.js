import { Worker } from "bullmq";
import connection from "../queue/connection.js";
import * as repositoryService from "../services/repository.service.js";
import * as githubService from "../services/github.service.js"
import * as gitService from "../services/git.service.js";
import * as projectService from "../services/project.service.js";
import * as contextService from "../services/context.service.js";
import * as promptService from "../services/prompt.service.js";
import * as aiService from "../services/ai.service.js";

const readmeWorker = new Worker(
    "readme-generation",

    async (job) => {

        try {


            console.log("📦 Processing Job");

            const {
                repositoryId,
                branch,
                commitSha,
            } = job.data;

            console.log("Repository ID:", repositoryId);
            console.log("Branch:", branch);
            console.log("Commit:", commitSha);

            const repository =
                await repositoryService.getRepositoryByGithubId(
                    repositoryId
                );

            if (!repository) {
                throw new Error("Repository not found");
            }

            console.log({
                githubId: repository.githubId,
                fullName: repository.fullName,
                cloneUrl: repository.cloneUrl,
                installationId: repository.installation.installationId,
            });

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

            console.log(
                "Repository cloned to:",
                repositoryPath
            );

            const project =
                await projectService.analyzeProject(
                    repositoryPath
                );

            const context =
                contextService.buildProjectContext(
                    project
                );

            const prompt =
                promptService.buildReadmePrompt(
                    context
                );
            const readme =
                await aiService.generateReadme(
                    prompt
                );

            console.log("================================");
            console.log("🤖 GENERATED README");
            console.log(readme);
            console.log("================================");

        } catch (error) {

            console.error("❌ Worker Error:");
            console.error(error);

            throw error;

        }

    },

    {
        connection,
    }
);

export default readmeWorker;