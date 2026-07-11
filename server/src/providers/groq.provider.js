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

    return response.choices[0].message.content;

};