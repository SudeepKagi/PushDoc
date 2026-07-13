import crypto from "crypto";
import readmeQueue from "../queue/queue.js";
import * as logger from "./logger.service.js";
import { ValidationError } from "../utils/errors.js";

export const handleWebhook = async (event, payload) => {
    logger.info(`Processing Webhook Event: ${event}`);
    switch (event) {
        case "push":
            return handlePushEvent(payload);
        default:
            logger.info(`Ignoring unsupported ${event} event`);
            return;
    }
};

const handlePushEvent = async (payload) => {
    // Validate payload shape
    if (!payload?.repository) {
        throw new ValidationError("Invalid push webhook payload: repository field is missing");
    }
    
    if (payload.repository.full_name === "SudeepKagi/PushDoc") {
        logger.warn("Ignoring PushDoc repository self-push event");
        return;
    }

    const latestCommit = payload.head_commit;
    if (!latestCommit) {
        logger.info("Ignoring push event: head_commit is missing (e.g., branch delete event)");
        return;
    }

    if (
        latestCommit.message.startsWith(
            "docs: update README"
        )
    ) {
        logger.info(
            "Skipping bot-generated README commit to avoid infinite generation loops"
        );
        return;
    }

    if (!payload.repository.id || !payload.ref || !payload.after) {
        throw new ValidationError("Missing required repository ID, branch ref, or commit SHA in webhook payload");
    }

    await readmeQueue.add(
        "generate-readme",
        {
            repositoryId: payload.repository.id,
            branch: payload.ref,
            commitSha: payload.after,
        }
    );

    logger.success("README generation job added to queue");
};

export const verifySignature = (
    signature,
    rawBody
) => {
    if (!signature || !rawBody) {
        return false;
    }

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
        logger.error("GITHUB_WEBHOOK_SECRET is not configured");
        return false;
    }

    const expectedSignature =
        "sha256=" +
        crypto.createHmac(
            "sha256",
            webhookSecret
        )
            .update(rawBody)
            .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // timingSafeEqual throws a fatal error if buffers have different lengths
    if (sigBuffer.length !== expectedBuffer.length) {
        logger.warn("Webhook signature length mismatch");
        return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
};