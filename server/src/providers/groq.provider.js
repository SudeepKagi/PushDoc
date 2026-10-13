import Groq from "groq-sdk";

export const generate = async (
    prompt,
    apiKey,
    { model, maxOutputTokens } = {}
) => {

    const groq = new Groq({
        apiKey,
    });

    const response =
        await groq.chat.completions.create({

            model,

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,
            max_tokens: maxOutputTokens,

        });

    const choice = response.choices?.[0];

    if (!choice) {
        throw new Error("Groq returned no choices.");
    }

    if (choice.finish_reason && !["stop", "eos"].includes(choice.finish_reason)) {
        const error = new Error(`Groq stopped early: ${choice.finish_reason}`);
        error.code = choice.finish_reason === "length" ? "LENGTH" : "SAFETY";
        throw error;
    }

    const content = choice.message?.content;
    if (!content || !content.trim()) {
        const error = new Error("Groq returned empty content.");
        error.code = "EMPTY_OUTPUT";
        throw error;
    }

    return content;

};
