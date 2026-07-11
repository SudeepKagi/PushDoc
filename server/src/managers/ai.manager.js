import { AI_PROVIDERS } from "../config/ai.config.js";
import { shouldRetry } from "../utils/ai.utils.js";

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

        console.log("");
        console.log(
            `🤖 Provider : ${provider.name}`
        );
        console.log(
            `📦 Model    : ${provider.model}`
        );

        let keyNumber = 1;

        for (const apiKey of provider.apiKeys) {

            try {

                console.log(
                    `🔑 Key      : ${keyNumber}/${provider.apiKeys.length}`
                );

                const response =
                    await provider.provider.generate(
                        prompt,
                        apiKey
                    );

                console.log(
                    `✅ ${provider.name} Success`
                );

                return response;

            }

            catch (error) {

                console.log(
                    `❌ Key ${keyNumber} Failed`
                );

                lastError = error;

                if (!shouldRetry(error)) {

                    throw error;

                }

                keyNumber++;

            }

        }

        console.log(
            `⚠ All ${provider.name} keys exhausted`
        );

    }

    throw lastError;

};