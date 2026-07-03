import crypto from "crypto";
import readmeQueue from "../queue/queue.js";

const signature =
    req.headers["x-hub-signature-256"];

if (
    !webhookService.verifySignature(
        signature,
        req.rawBody
    )
) {
    return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
    });
}
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

    await readmeQueue.add(
        "generate-readme",
        {
            repository: payload.repository.full_name,
            branch: payload.ref,
            commits: payload.commits.length,
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