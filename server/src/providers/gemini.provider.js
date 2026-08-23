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

/**
 * Calls Gemini with a JSON schema, asking it to return structured JSON output.
 *
 * Using response_mime_type: "application/json" tells Gemini to constrain its
 * output to valid JSON that matches the provided schema. This is preferable
 * to asking the model to "return JSON" in the prompt because:
 *   1. It's enforced at the API level — malformed JSON is not returned.
 *   2. It removes the need to strip markdown code fences from the response.
 *   3. It pairs well with a low temperature for deterministic extraction tasks.
 *
 * @param {string} prompt - The generation prompt
 * @param {object} jsonSchema - A JSON Schema object (draft-07 or later)
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<object>} - Parsed JSON object matching the schema
 */
export const generateStructured = async (prompt, jsonSchema, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
            // Low temperature for structured extraction — we want deterministic
            // output that matches the schema, not creative variation.
            temperature: 0.1,
        },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
        throw new Error("Gemini returned no candidates for structured generation.");
    }

    if (candidate.finishReason && candidate.finishReason !== "STOP") {
        throw new Error(`Gemini stopped early during structured generation: ${candidate.finishReason}`);
    }

    const rawText =
        candidate.content?.parts
            ?.map(part => part.text ?? "")
            .join("") ?? "";

    if (!rawText.trim()) {
        throw new Error("Gemini returned empty structured content.");
    }

    // Gemini guarantees valid JSON when response_mime_type is set, but we
    // still parse defensively so any unexpected wrapping doesn't crash us.
    return JSON.parse(rawText);
};