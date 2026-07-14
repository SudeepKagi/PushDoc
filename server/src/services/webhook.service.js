import crypto from "crypto";
import readmeQueue from "../queue/queue.js";
import * as repositoryService from "./repository.service.js";
import * as logger from "./logger.service.js";
import { ValidationError } from "../utils/errors.js";

export const handleWebhook = async (event, payload) => {
    logger.info(`Processing Webhook Event: ${event}`);
    switch (event) {
        case "push":
            return handlePushEvent(payload);
        case "installation_repositories":
            return handleInstallationRepositoriesEvent(payload);
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

    // Only process pushes to the repository's default branch
    const pushedBranch = payload.ref.replace("refs/heads/", "");
    const defaultBranch = payload.repository.default_branch || "main";
    if (pushedBranch !== defaultBranch) {
        logger.info(
            `Ignoring push to non-default branch "${pushedBranch}" (default: "${defaultBranch}")`
        );
    }

    const repository = await repositoryService.getRepositoryByGithubId(payload.repository.id);
    if (!repository) {
        logger.info(`Ignoring push event: repository ${payload.repository.full_name} is not registered in PushDoc`);
        return;
    }

    if (!repository.isActive) {
        logger.info(`Ignoring push event: AI updates are disabled for repository ${repository.fullName}`);
        return;
    }


    await readmeQueue.add(
        "generate-readme",
        {
            repositoryId: payload.repository.id,
            branch: payload.ref,
            commitSha: payload.after,
        },
        {
            // Retry up to 3 times with exponential backoff on transient errors
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        }
    );

    logger.success("README generation job added to queue");
};

const handleInstallationRepositoriesEvent = async (payload) => {
    const action = payload.action; // "added" or "removed"
    const installationId = payload.installation?.id;

    if (!installationId) {
        logger.warn("installation_repositories event missing installation ID");
        return;
    }

    if (action === "added" && Array.isArray(payload.repositories_added)) {
        logger.info(
            `Installation ${installationId}: ${payload.repositories_added.length} repo(s) added — sync required`
        );
        // Log each added repo; actual DB upsert happens on the next manual/auto sync.
        // This ensures the user's next dashboard refresh picks up the new repos.
        for (const repo of payload.repositories_added) {
            logger.info(`  + ${repo.full_name}`);
        }
    }

    if (action === "removed" && Array.isArray(payload.repositories_removed)) {
        logger.info(
            `Installation ${installationId}: ${payload.repositories_removed.length} repo(s) removed`
        );
        for (const repo of payload.repositories_removed) {
            logger.info(`  - ${repo.full_name} (id: ${repo.id})`);
            try {
                // Remove the repository from our DB when it is uninstalled
                await repositoryService.deleteRepositoryByGithubId(repo.id);
                logger.success(`  Deleted repository ${repo.full_name} from DB`);
            } catch (err) {
                logger.warn(`  Failed to delete ${repo.full_name}: ${err.message}`);
            }
        }
    }
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