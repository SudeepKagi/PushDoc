import crypto from "crypto";
import readmeQueue from "../queue/queue.js";

export const handleWebhook = async (event, payload) => {
    console.log("Processing Event:", event);
    switch (event) {
        case "push":
            return handlePushEvent(payload);
        default:
            console.log(`Ignoring ${event} event`);
            return;
    }
};

const handlePushEvent = async (payload) => {
    if (payload.repository.full_name === "SudeepKagi/PushDoc") {
        console.log("⚠️ Ignoring PushDoc repository");
        return;
    }

    const latestCommit = payload.head_commit;
    if (
        latestCommit.message.startsWith(
            "docs: update README"
        )
    ) {
        console.log(
            "🤖 Skipping generated README commit"
        );
        return;
    }

    await readmeQueue.add(
        "generate-readme",
        {
            repositoryId: payload.repository.id,
            branch: payload.ref,
            commitSha: payload.after,
        }
    );

    console.log("✅ Job added to queue");

};

export const verifySignature = (
    signature,
    rawBody
) => {
    const expectedSignature =
        "sha256=" +
        crypto.createHmac(
            "sha256",
            process.env.GITHUB_WEBHOOK_SECRET
        )
            .update(rawBody)
            .digest("hex");
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};