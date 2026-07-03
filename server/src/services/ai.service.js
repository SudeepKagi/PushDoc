import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateReadme = async (
    prompt
) => {

    const response =
        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt,

        });

    return response.text;

};