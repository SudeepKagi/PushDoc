import * as repositoryReader from "../readers/repository.reader.js";
import * as repositoryAnalyzer from "../analyzers/repository.analyzer.js";
import * as repositoryContextBuilder from "../builders/repositoryContext.builder.js";
import * as promptBuilder from "../builders/prompt.builder.js";
import * as factsExtractor from "../analyzers/facts.extractor.js";
import * as critic from "../analyzers/critic.js";
import * as diagramService from "../services/diagram.service.js";
import * as aiService from "../services/ai.service.js";
import * as aiClient from "../services/ai.client.js";
import { config } from "../config/app.config.js";
import * as snapshotService from "../services/snapshot.service.js";
import * as validatorService from "../services/validator.service.js";
import { validateReadme } from "../validators/readme.validator.js";
import * as logger from "../services/logger.service.js";

export const generateReadme = async (
    repositoryPath,
    jobId,
    generationContext = {}
) => {
    const startedAt = performance.now();
    const stageTimings = {};
    const mark = (stage, started) => { stageTimings[stage] = Math.round(performance.now() - started); };

    logger.info(
        jobId,
        "Reading repository..."
    );

    const readStarted = performance.now();
    const repository =
        repositoryReader.readRepository(
            repositoryPath
        );
    mark("READING", readStarted);

    logger.info(
        jobId,
        "Analyzing repository..."
    );

    const analysisStarted = performance.now();
    const knowledge =
        repositoryAnalyzer.analyzeRepository(
            repository
        );
    mark("ANALYZING", analysisStarted);

    logger.info(
        jobId,
        "Extracting deterministic ground-truth facts..."
    );

    const factsStarted = performance.now();
    const facts = factsExtractor.extractFacts(knowledge);
    mark("FACTS", factsStarted);

    logger.info(
        jobId,
        "Building repository context..."
    );

    const contextStarted = performance.now();
    const repositoryContext =
        await repositoryContextBuilder.buildRepositoryContext(
            repository,
            knowledge
        );
    mark("CONTEXT", contextStarted);

    logger.info(
        jobId,
        "Building grounded prompt..."
    );

    const prompt =
        promptBuilder.buildPrompt(
            repositoryContext,
            facts,
            knowledge
        );

    logger.info(
        jobId,
        "Calling AI provider..."
    );

    const generationStarted = performance.now();
    const createAntigravityPayload = async () => ({
        job_id: String(jobId), repo: generationContext.repo,
        facts, existing_readme: generationContext.existingReadme || "",
        snapshot_base64: await snapshotService.createSnapshot(repositoryPath),
    });
    let rawReadme;
    let antigravityReport = null;
    if (config.ai.backend === "antigravity") {
        const result = await aiClient.generateReadmeWithAntigravity(await createAntigravityPayload());
        if (!result.report?.gate_passed) throw new Error("Antigravity output did not pass its integrity gate.");
        rawReadme = result.readme_markdown;
        antigravityReport = result.report;
    } else {
        rawReadme = await aiService.generateReadme(prompt);
        if (config.ai.backend === "shadow") {
            try {
                const result = await aiClient.generateReadmeWithAntigravity(await createAntigravityPayload());
                antigravityReport = result.report;
                logger.info(jobId, `Shadow AI run completed (gate: ${result.report?.gate_passed === true})`);
            } catch (error) {
                antigravityReport = { shadowError: error.message };
                logger.warn(jobId, `Shadow AI run failed: ${error.message}`);
            }
        }
    }
    mark("GENERATION", generationStarted);

    logger.info(
        jobId,
        "Generating deterministic Mermaid architecture diagram..."
    );

    const architectureSection = diagramService.generateArchitectureSection(repository.files, knowledge);

    let combinedReadme = rawReadme;
    if (architectureSection && !combinedReadme.includes("```mermaid")) {
        const archHeaderRegex = /(##\s*[^\n]*System Architecture[^\n]*\n+)([\s\S]*?)(?=\n---\s*\n|\n##\s+|$)/i;
        const structureRegex = /##\s*[^\n]*Project Structure/i;
        const installRegex = /##\s*[^\n]*Installation/i;

        if (archHeaderRegex.test(combinedReadme)) {
            const cleanDiagram = architectureSection.replace(/^##\s*[^\n]*System Architecture\n+/i, "");
            combinedReadme = combinedReadme.replace(
                archHeaderRegex,
                `$1$2\n\n${cleanDiagram}\n\n`
            );
        } else if (structureRegex.test(combinedReadme)) {
            combinedReadme = combinedReadme.replace(
                structureRegex,
                `${architectureSection}\n---\n\n$&`
            );
        } else if (installRegex.test(combinedReadme)) {
            combinedReadme = combinedReadme.replace(
                installRegex,
                `${architectureSection}\n---\n\n$&`
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
        antigravityReport,
        metrics: { ...stageTimings, TOTAL: Math.round(performance.now() - startedAt) },
    };

};
