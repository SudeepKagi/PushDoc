import { config } from "../config/app.config.js";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const generateReadmeWithAntigravity = async (payload) => {
    const baseUrl = config.ai.serviceUrl;
    if (!baseUrl || !config.ai.serviceToken) {
        throw new Error("Antigravity AI backend is enabled but AI_SERVICE_URL or AI_SERVICE_TOKEN is missing.");
    }
    const headers = { "content-type": "application/json", authorization: `Bearer ${config.ai.serviceToken}` };
    const create = await fetch(`${baseUrl}/v1/readme-jobs`, { method: "POST", headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(30_000) });
    if (!create.ok) throw new Error(`AI service creation request failed: ${create.status}`);
    for (let attempt = 0; attempt < 60; attempt++) {
        const poll = await fetch(`${baseUrl}/v1/readme-jobs/${encodeURIComponent(payload.job_id)}`, { headers, signal: AbortSignal.timeout(10_000) });
        if (!poll.ok) throw new Error(`AI service poll failed: ${poll.status}`);
        const result = await poll.json();
        if (result.status === "COMPLETED") return result;
        if (result.status === "FAILED") throw new Error(result.report?.violations?.join("; ") || "AI service failed");
        await sleep(1_000);
    }
    throw new Error("AI service polling deadline exceeded.");
};
