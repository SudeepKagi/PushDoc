import { GoogleGenAI } from "@google/genai";

export const generate = async (
    prompt,
    apiKey
) => {

    const ai =
        new GoogleGenAI({

            apiKey,

        });

    const response =
        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt,

        });

    return response.text;

};