import Groq from "groq-sdk";

export const generate = async (
    prompt,
    apiKey
) => {

    const groq = new Groq({
        apiKey,
    });

    const response =
        await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,

        });

    const choice = response.choices?.[0];

    if (!choice) {
        throw new Error("Groq returned no choices.");
    }

    if (choice.finish_reason && !["stop", "eos", "length"].includes(choice.finish_reason)) {
        throw new Error(`Groq stopped early: ${choice.finish_reason}`);
    }

    const content = choice.message?.content;
    if (!content || !content.trim()) {
        throw new Error("Groq returned empty content.");
    }

    return content;

};