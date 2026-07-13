import * as webhookService from "../services/webhook.service.js";

export const githubWebhook = async (req, res) => {

    try {

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

        const event =
            req.headers["x-github-event"];

        await webhookService.handleWebhook(
            event,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Webhook processed",
        });

    } catch (error) {

        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });

    }

};