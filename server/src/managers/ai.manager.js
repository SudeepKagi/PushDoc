import { AI_PROVIDERS } from "../config/ai.config.js";
import { shouldRetry } from "../utils/ai.utils.js";
import * as logger from "../services/logger.service.js";
import { AIProviderError } from "../utils/errors.js";

export const generateReadme = async (
    prompt
) => {

    const providers =
        AI_PROVIDERS
            .filter(
                provider => provider.enabled
            )
            .sort(
                (a, b) =>
                    a.priority - b.priority
            );

    let lastError;

    for (const provider of providers) {

        logger.info(
            `🤖 Trying AI Provider: ${provider.name} (Model: ${provider.model})`
        );

        let keyNumber = 1;

        for (const apiKey of provider.apiKeys) {

            try {

                logger.debug(
                    `🔑 Using API Key: ${keyNumber}/${provider.apiKeys.length}`
                );

                const response =
                    await provider.provider.generate(
                        prompt,
                        apiKey
                    );

                logger.success(
                    `✅ AI Provider ${provider.name} generated README successfully`
                );

                return response;

            }

            catch (error) {

                logger.warn(
                    `❌ AI Provider key ${keyNumber} failed: ${error.message}`
                );

                lastError = error;

                if (!shouldRetry(error)) {
                    logger.error(`Non-retryable AI error encountered: ${error.message}`);
                    throw new AIProviderError(`AI Generation failed on provider ${provider.name} (non-retryable): ${error.message}`);
                }

                keyNumber++;

            }

        }

        logger.warn(
            `⚠️ All ${provider.name} keys exhausted. Attempting next provider...`
        );

    }

    throw new AIProviderError(
        `All AI providers failed. Last error: ${lastError?.message || "unknown"}`
    );

};