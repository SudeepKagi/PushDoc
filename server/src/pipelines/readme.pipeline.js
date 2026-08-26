import * as repositoryReader from "../readers/repository.reader.js";
import * as repositoryAnalyzer from "../analyzers/repository.analyzer.js";
import * as repositoryContextBuilder from "../builders/repositoryContext.builder.js";
import * as promptBuilder from "../builders/prompt.builder.js";
import * as factsExtractor from "../analyzers/facts.extractor.js";
import * as critic from "../analyzers/critic.js";
import * as diagramService from "../services/diagram.service.js";
import * as aiService from "../services/ai.service.js";
import * as validatorService from "../services/validator.service.js";
import { validateReadme } from "../validators/readme.validator.js";
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
        "Analyzing repository..."
    );

    const knowledge =
        repositoryAnalyzer.analyzeRepository(
            repository
        );

    logger.info(
        jobId,
        "Extracting deterministic ground-truth facts..."
    );

    const facts = factsExtractor.extractFacts(knowledge);

    logger.info(
        jobId,
        "Building repository context..."
    );

    const repositoryContext =
        await repositoryContextBuilder.buildRepositoryContext(
            repository,
            knowledge
        );

    logger.info(
        jobId,
        "Building grounded prompt..."
    );

    const prompt =
        promptBuilder.buildPrompt(
            repositoryContext,
            facts
        );

    logger.info(
        jobId,
        "Calling AI provider..."
    );

    const rawReadme =
        await aiService.generateReadme(
            prompt
        );

    logger.info(
        jobId,
        "Generating deterministic Mermaid architecture diagram..."
    );

    const architectureSection = diagramService.generateArchitectureSection(repository.files, knowledge);

    let combinedReadme = rawReadme;
    if (architectureSection && !combinedReadme.includes("```mermaid")) {
        if (combinedReadme.includes("## Project Structure")) {
            combinedReadme = combinedReadme.replace(
                /(## Project Structure[\s\S]*?)(---|\n## )/,
                `$1\n---\n\n${architectureSection}\n\n$2`
            );
        } else if (combinedReadme.includes("## Installation")) {
            combinedReadme = combinedReadme.replace(
                "## Installation",
                `${architectureSection}\n---\n\n## Installation`
            );
        } else {
            combinedReadme = `${combinedReadme}\n\n---\n\n${architectureSection}`;
        }
    }

    logger.info(
        jobId,
        "Validating and sanitizing generated README..."
    );

    const sanitizedReadme = validatorService.validateAndSanitizeReadme(
        combinedReadme,
        knowledge
    );

    const structuralReport = validateReadme(sanitizedReadme, knowledge);
    if (structuralReport.warnings.length > 0) {
        logger.warn(
            jobId,
            `Structural validator found ${structuralReport.warnings.length} issue(s) (score ${structuralReport.score}/100): ${structuralReport.warnings.join(" | ")}`
        );
    } else {
        logger.info(
            jobId,
            "Structural validation passed — clean syntax and complete section coverage"
        );
    }

    logger.info(
        jobId,
        "Running post-generation critic hallucination pass..."
    );

    const criticReport = critic.critique(sanitizedReadme, facts, knowledge);

    if (!criticReport.isClean) {
        logger.warn(
            jobId,
            `Critic found ${criticReport.violations.length} ungrounded identifiers: ${criticReport.violations.map(v => `${v.type}:${v.value}`).join(", ")}`
        );
    } else {
        logger.info(
            jobId,
            "Critic scan passed — zero ungrounded identifiers found"
        );
    }

    logger.success(
        jobId,
        "README content generated, diagrammed, validated & critiqued"
    );

    return {
        readme: sanitizedReadme,
        knowledge,
        facts,
        criticReport,
        structuralReport,
    };

};