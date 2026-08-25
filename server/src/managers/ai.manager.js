import CircuitBreaker from "opossum";
import { AI_PROVIDERS } from "../config/ai.config.js";
import { config } from "../config/app.config.js";
import { shouldRetry } from "../utils/ai.utils.js";
import * as logger from "../services/logger.service.js";
import { AIProviderError } from "../utils/errors.js";

// ── Circuit Breakers ─────────────────────────────────────────────────────────
//
// opossum is a circuit breaker library. A circuit breaker wraps a function
// and tracks how often it fails. If failures exceed the threshold, the breaker
// "opens" and subsequent calls throw immediately instead of waiting for a slow
// timeout. After a cooldown (resetTimeout), it allows one test call through
// (half-open state) to check if the service recovered.
//
// Why we need this: without a breaker, a single rate-limited or hung AI
// provider can stall every job for 30+ seconds before we fall through to the
// next provider. With a breaker, after a few failures we give up in <1ms
// and try the next provider immediately.
//
// One breaker per provider (not per key): if all Gemini keys are exhausted in
// the key rotation loop below, the breaker starts accumulating errors. When
// it opens, we skip directly to Groq without trying any more Gemini keys.

const breakerOptions = {
    timeout: config.circuitBreaker.timeout,
    errorThresholdPercentage: config.circuitBreaker.errorThresholdPercentage || 70,
    resetTimeout: config.circuitBreaker.resetTimeout || 10_000,
    volumeThreshold: config.circuitBreaker.volumeThreshold || 5,
};

// Build one breaker per provider at module load time.
// The breaker wraps a single async function: (prompt, apiKey) → string.
const providerBreakers = new Map();

for (const provider of AI_PROVIDERS) {
    const breaker = new CircuitBreaker(
        // The function being protected: the raw provider generate call.
        (prompt, apiKey) => provider.provider.generate(prompt, apiKey),
        breakerOptions
    );

    // Log state transitions so failures are visible in the worker logs.
    breaker.on("open",     () => logger.warn(`Circuit breaker OPEN for ${provider.name} — skipping until reset`));
    breaker.on("halfOpen", () => logger.info(`Circuit breaker HALF-OPEN for ${provider.name} — testing recovery`));
    breaker.on("close",    () => logger.success(`Circuit breaker CLOSED for ${provider.name} — provider recovered`));

    providerBreakers.set(provider.name, breaker);
}

// ── generateReadme ────────────────────────────────────────────────────────────

export const generateReadme = async (prompt) => {
    const providers = AI_PROVIDERS
        .filter(provider => provider.enabled)
        .sort((a, b) => a.priority - b.priority);

    let lastError;

    for (const provider of providers) {
        const breaker = providerBreakers.get(provider.name);

        logger.info(`Trying AI provider: ${provider.name} (model: ${provider.model})`);

        let keyNumber = 1;

        for (const apiKey of provider.apiKeys) {
            try {
                logger.debug(`Using API key ${keyNumber}/${provider.apiKeys.length} for ${provider.name}`);

                let response;
                if (breaker && !breaker.opened) {
                    try {
                        response = await breaker.fire(prompt, apiKey);
                    } catch (fireErr) {
                        if (fireErr.message?.includes("Breaker is open") || fireErr.name === "OpenCircuitError") {
                            logger.warn(`${provider.name} breaker is open — attempting direct generation call`);
                            response = await provider.provider.generate(prompt, apiKey);
                        } else {
                            throw fireErr;
                        }
                    }
                } else {
                    response = await provider.provider.generate(prompt, apiKey);
                }

                logger.success(`${provider.name} generated README successfully`);
                return response;

            } catch (error) {
                logger.warn(`${provider.name} key ${keyNumber} failed: ${error.message}`);
                lastError = error;

                if (!shouldRetry(error)) {
                    logger.error(`Non-retryable error from ${provider.name}: ${error.message}`);
                    throw new AIProviderError(`AI generation failed (non-retryable) on ${provider.name}: ${error.message}`);
                }

                keyNumber++;
            }
        }

        logger.warn(`All ${provider.name} keys exhausted — trying next provider`);
    }

    throw new AIProviderError(
        `All AI providers failed. Last error: ${lastError?.message || "unknown"}`
    );
};