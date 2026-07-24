import { GoogleGenAI } from "@google/genai";
import { config } from "../config/app.config.js";
import { cosineSimilarity } from "./embedding.service.js";

const EMBEDDING_MODEL = "text-embedding-004";

/**
 * Performs semantic similarity search over an in-memory vector index.
 *
 * @param {array} vectorIndex Array of chunks with embedding vectors
 * @param {string} queryText Semantic query string
 * @param {number} topK Number of top relevant chunks to retrieve
 * @returns {array} Top relevant chunks sorted by similarity
 */
export const queryVectorIndex = async (vectorIndex, queryText, topK = 8) => {
    if (!vectorIndex || vectorIndex.length === 0) return [];

    const apiKey = config.ai.geminiKeys[0] || process.env.GEMINI_API_KEY;
    if (!apiKey) return [];

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: queryText,
        });

        const queryVector = response.embedding?.values;
        if (!queryVector) return [];

        const scored = vectorIndex.map((chunk) => ({
            ...chunk,
            score: cosineSimilarity(queryVector, chunk.vector),
        }));

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, topK);
    } catch {
        // Fallback to top-K chunks by file priority if embedding query fails
        return vectorIndex.slice(0, topK);
    }
};
