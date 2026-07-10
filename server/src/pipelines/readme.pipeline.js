import * as repositoryReader from "../readers/repository.reader.js";
import * as repositoryContextBuilder from "../builders/repositoryContext.builder.js";
import * as promptBuilder from "../builders/prompt.builder.js";
import * as aiService from "../services/ai.service.js";
import * as logger from "../services/logger.service.js";

export const generateReadme = async (
    repositoryPath,
    jobId
) => {

    logger.info(
        jobId,
        "Reading repository..."
    );

    const repository =
        repositoryReader.readRepository(
            repositoryPath
        );

    logger.info(
        jobId,
        "Building repository context..."
    );

    const repositoryContext =
        repositoryContextBuilder.buildRepositoryContext(
            repository
        );

    logger.info(
        jobId,
        "Building prompt..."
    );

    const prompt =
        promptBuilder.buildPrompt(
            repositoryContext
        );

    logger.info(
        jobId,
        "Calling Gemini..."
    );

    const readme =
        await aiService.generateReadme(
            prompt
        );

    logger.success(
        jobId,
        "README content generated"
    );

    return readme;

};