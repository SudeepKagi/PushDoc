import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config/app.config.js";
import * as cache from "./cache.service.js";

const EMBEDDING_MODEL = "text-embedding-004";
const MAX_CHUNK_LINES = 40;

/**
 * Computes a deterministic SHA-1 hash of a string.
 * Used as the Redis cache key for embedding vectors.
 *
 * We use the chunk content (not the file path) as the input so:
 *   - Renaming a file with identical content still gets a cache hit.
 *   - Editing even one character in a file produces a new, distinct key.
 *   - Two different files with the same content share one cached vector
 *     (correct — identical text should produce identical embeddings).
 */
const contentSha = (text) =>
    crypto.createHash("sha1").update(text).digest("hex");

/**
 * Splits repository files into clean code chunks for embedding.
 * Each chunk is a slice of a file's lines. Binary/asset files are skipped.
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
 *
 * Cache strategy: before each API call, check Redis for a stored vector keyed
 * by SHA-1(chunk.content). On a hit, use the cached vector (no API call). On a
 * miss, call the API and write the result to Redis with a 7-day TTL.
 *
 * This means re-runs on unchanged files cost zero embedding API calls.
 * Only files whose content actually changed (new SHA) incur an API call.
 */
export const buildVectorIndex = async (chunks) => {
    const apiKey = config.ai.geminiKeys[0] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("No Gemini API key available for building embedding vector index.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const ttl = config.cache.embeddingTtlSeconds;
    // Cap candidate chunks to top 25 to guarantee fast sub-5s index creation
    const targetChunks = (chunks || []).slice(0, 25);

    const BATCH_SIZE = 5;
    const indexedChunks = [];

    for (let i = 0; i < targetChunks.length; i += BATCH_SIZE) {
        const batch = targetChunks.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map(async (chunk) => {
                try {
                    const sha = contentSha(chunk.content);
                    const cacheKey = `embed:${sha}`;

                    // Step 1: Check cache
                    const cachedVector = await cache.get(cacheKey);
                    if (cachedVector) {
                        return { ...chunk, vector: cachedVector };
                    }

                    // Step 2: Call Gemini embedding API with 6s timeout guard
                    const embedPromise = ai.models.embedContent({
                        model: EMBEDDING_MODEL,
                        contents: chunk.content,
                    });
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Embedding timeout")), 6000)
                    );
                    const response = await Promise.race([embedPromise, timeoutPromise]);

                    const values = response?.embedding?.values;
                    if (values) {
                        await cache.set(cacheKey, values, ttl);
                        return { ...chunk, vector: values };
                    }
                    return null;
                } catch {
                    return null;
                }
            })
        );

        for (const res of batchResults) {
            if (res && res.vector) {
                indexedChunks.push(res);
            }
        }
    }

    return indexedChunks;
};

