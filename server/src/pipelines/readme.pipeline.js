import * as repositoryReader from "../readers/repository.reader.js";
import * as repositoryContextBuilder from "../builders/repositoryContext.builder.js";
import * as promptBuilder from "../builders/prompt.builder.js";
import * as aiService from "../services/ai.service.js";

export const generateReadme = async (
    repositoryPath
) => {

    console.log("📂 Reading repository...");

    const repository =
        repositoryReader.readRepository(
            repositoryPath
        );

    console.log("🧠 Building repository context...");

    const repositoryContext =
        repositoryContextBuilder.buildRepositoryContext(
            repository
        );

    console.log("📝 Building prompt...");

    const prompt =
        promptBuilder.buildPrompt(
            repositoryContext
        );

    console.log("🤖 Generating README...");

    const readme =
        await aiService.generateReadme(
            prompt
        );

    console.log("✅ README generated");

    return readme;

};