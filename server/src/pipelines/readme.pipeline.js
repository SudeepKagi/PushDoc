import * as projectService from "../services/project.service.js";
import * as contextService from "../services/context.service.js";
import * as promptService from "../services/prompt.service.js";
import * as aiService from "../services/ai.service.js";

export const generateReadme = async (
    repositoryPath
) => {

    const analysis =
        await projectService.analyzeProject(
            repositoryPath
        );

    const context =
        contextService.buildProjectContext(
            analysis
        );

    const prompt =
        promptService.buildReadmePrompt(
            context
        );

    const readme =
        await aiService.generateReadme(
            prompt
        );

    return readme;

};