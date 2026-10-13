import { GoogleGenAI } from "@google/genai";
import { config } from "../config/app.config.js";
import { cosineSimilarity } from "./embedding.service.js";

/**
 * Performs semantic similarity search over an in-memory vector index.
 *
 * @param {array} vectorIndex Array of chunks with embedding vectors
 * @param {string} queryText Semantic query string
 * @param {number} topK Number of top relevant chunks to retrieve
 * @returns {array} Top relevant chunks sorted by similarity
 */
export const queryVectorIndex = async (vectorIndex, queryText, topK = 8) => {
    if (!vectorIndex || vectorIndex.length === 0) {
        throw new Error("Cannot query an empty embedding index.");
    }

    const apiKey = config.ai.geminiKeys[0] || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No Gemini API key available for retrieval query.");

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.embedContent({
            model: config.ai.embeddingModel,
            contents: queryText,
            config: { outputDimensionality: config.ai.embeddingDimensions },
        });

        const queryVector = response.embedding?.values;
        if (!queryVector) throw new Error("Embedding provider returned no query vector.");

        const scored = vectorIndex.map((chunk) => ({
            ...chunk,
            score: cosineSimilarity(queryVector, chunk.vector),
        }));

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, topK);
    } catch (error) {
        throw new Error(`Retrieval query embedding failed: ${error.message}`, { cause: error });
    }
};
