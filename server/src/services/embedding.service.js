import { GoogleGenAI } from "@google/genai";
import { config } from "../config/app.config.js";

const EMBEDDING_MODEL = "text-embedding-004";
const MAX_CHUNK_LINES = 40;

/**
 * Splits repository files into clean code chunks for embedding.
 */
export const chunkRepository = (files) => {
    const chunks = [];

    for (const file of files || []) {
        const ext = file.extension ? file.extension.toLowerCase() : "";
        // Skip non-code / binary assets
        if ([".png", ".jpg", ".jpeg", ".ico", ".svg", ".zip", ".pdf"].includes(ext)) {
            continue;
        }

        const lines = (file.content || "").split("\n");

        if (lines.length <= MAX_CHUNK_LINES) {
            chunks.push({
                id: `${file.path}:1-${lines.length}`,
                filePath: file.path,
                startLine: 1,
                endLine: lines.length,
                content: file.content,
            });
        } else {
            // Split into overlapping chunks of MAX_CHUNK_LINES
            for (let i = 0; i < lines.length; i += MAX_CHUNK_LINES - 10) {
                const slice = lines.slice(i, i + MAX_CHUNK_LINES);
                if (slice.length === 0) break;

                const chunkContent = slice.join("\n");
                chunks.push({
                    id: `${file.path}:${i + 1}-${i + slice.length}`,
                    filePath: file.path,
                    startLine: i + 1,
                    endLine: i + slice.length,
                    content: chunkContent,
                });
            }
        }
    }

    return chunks;
};

/**
 * Computes cosine similarity between two numeric vectors.
 */
export const cosineSimilarity = (vecA, vecB) => {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Generates embeddings for a batch of text chunks using Gemini text-embedding-004.
 */
export const buildVectorIndex = async (chunks) => {
    const apiKey = config.ai.geminiKeys[0] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("No Gemini API key available for building embedding vector index.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const indexedChunks = [];

    // Batch embed chunks (max 20 per request)
    const BATCH_SIZE = 15;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        for (const chunk of batch) {
            try {
                const response = await ai.models.embedContent({
                    model: EMBEDDING_MODEL,
                    contents: chunk.content,
                });

                const values = response.embedding?.values;
                if (values) {
                    indexedChunks.push({
                        ...chunk,
                        vector: values,
                    });
                }
            } catch {
                // Ignore individual embedding failures to maintain resilience
            }
        }
    }

    return indexedChunks;
};
