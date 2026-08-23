import * as webhookService from "../services/webhook.service.js";
import * as logger from "../services/logger.service.js";

export const githubWebhook = (req, res) => {

    // Step 1: Verify the HMAC-SHA256 signature against the raw request body.
    // Must happen synchronously before we do anything else with the payload.
    const signature = req.headers["x-hub-signature-256"];

    if (!webhookService.verifySignature(signature, req.rawBody)) {
        return res.status(401).json({
            success: false,
            message: "Invalid webhook signature",
        });
    }

    // Step 2: Acknowledge receipt immediately with 202.
    // GitHub considers a delivery failed if it doesn't get a 2xx within ~10s.
    // All actual work (DB lookups, queue.add) happens asynchronously after this.
    res.status(202).json({ success: true, message: "Webhook accepted" });

    // Step 3: Fire-and-forget. The service handles idempotency, validation,
    // and enqueueing. We deliberately do NOT await — the response is already sent.
    const event = req.headers["x-github-event"];
    const deliveryId = req.headers["x-github-delivery"];

    webhookService.enqueueWebhook(event, req.body, deliveryId).catch((err) => {
        // Errors here cannot affect the HTTP response (already sent), so just log.
        logger.error(`enqueueWebhook failed for delivery ${deliveryId}: ${err.message}`);
    });

};