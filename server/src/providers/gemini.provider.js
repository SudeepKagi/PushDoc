import { GoogleGenAI } from "@google/genai";

export const generate = async (prompt, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
        throw new Error("Gemini returned no candidates.");
    }

    // Surface *why* there's no content (safety block, token limit, etc.)
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
        throw new Error(
            `Gemini stopped early: ${candidate.finishReason}`
        );
    }

    const markdown =
        candidate.content?.parts
            ?.map(part => part.text ?? "")
            .join("") ?? "";   // <-- fallback so markdown is always a string

    if (!markdown.trim()) {
        throw new Error("Gemini returned empty content.");
    }

    return markdown;
};