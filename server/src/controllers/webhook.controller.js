import * as webhookService from "../services/webhook.service.js";

export const githubWebhook = async (req, res) => {

    try {

        console.log("Webhook Received");

        console.log("Event:", req.headers["x-github-event"]);

        console.log("Payload:", req.body);

        return res.status(200).json({
            success: true,
            message: "Webhook received",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};