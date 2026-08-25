import crypto from "crypto";
import readmeQueue from "../queue/queue.js";
import redisConnection from "../queue/connection.js";
import * as repositoryService from "./repository.service.js";
import * as logger from "./logger.service.js";
import { ValidationError } from "../utils/errors.js";

// How long to remember a delivery ID to prevent reprocessing (24 hours).
// GitHub may redeliver a webhook if it doesn't receive a 2xx — this dedupes those.
const DELIVERY_ID_TTL_SECONDS = 86_400;

/**
 * Called by the webhook controller after signature verification.
 * Fire-and-forget from the controller — this runs after the 202 is sent.
 *
 * @param {string} event - X-GitHub-Event header value (e.g. "push")
 * @param {object} payload - Parsed JSON body
 * @param {string} deliveryId - X-GitHub-Delivery header value (unique per delivery)
 */
export const enqueueWebhook = async (event, payload, deliveryId) => {
    logger.info(`Received webhook event: ${event} (delivery: ${deliveryId})`);

    // Idempotency: check if we've already processed this exact delivery.
    // Redis SET with NX (only set if Not eXists) and EX (TTL) is atomic —
    // no race condition between the check and the set.
    if (deliveryId) {
        const key = `delivery:${deliveryId}`;
        // Returns "OK" if key was set (first time seen), null if key already existed.
        const result = await redisConnection.set(key, "1", "NX", "EX", DELIVERY_ID_TTL_SECONDS);
        if (result === null) {
            logger.info(`Skipping duplicate delivery ${deliveryId} (already processed)`);
            return;
        }
    }

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

    const commitMsg = latestCommit?.message || "";
    if (commitMsg.startsWith("docs: update README")) {
        logger.info("Skipping bot-generated README commit to avoid infinite generation loops");
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
        return;
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

    // Security Gate: Validate that the incoming installation ID matches the repository's registered installation
    const incomingInstallationId = payload.installation?.id;
    if (incomingInstallationId && repository.installation?.installationId) {
        if (incomingInstallationId.toString() !== repository.installation.installationId.toString()) {
            logger.warn(
                `Security: Webhook installation ID (${incomingInstallationId}) does not match registered installation ID (${repository.installation.installationId}) for ${repository.fullName} — dropping event`
            );
            return;
        }
    }

    // Stable jobId per repository so burst pushes debounce/coalesce onto latest commit
    const jobId = `push-${repository.githubId}`;

    try {
        const existing = await readmeQueue.getJob(jobId);
        if (existing) {
            const state = await existing.getState();
            if (state === "waiting" || state === "delayed") {
                await existing.remove();
            }
        }
    } catch (err) {
        logger.warn(`Could not check/replace pending job for ${repository.fullName}: ${err.message}`);
    }

    await readmeQueue.add(
        "generate-readme",
        {
            repositoryId: payload.repository.id,
            branch: payload.ref,
            commitSha: payload.after,
        },
        {
            jobId,
            // Retry up to 3 times with exponential backoff on transient errors
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: 100,
        }
    );

    logger.success(`README generation job queued (jobId: ${jobId})`);
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

/**
 * Verifies an X-Hub-Signature-256 header against the raw request body.
 * Uses timingSafeEqual to prevent timing-based signature oracle attacks.
 *
 * @param {string} signature - Full "sha256=..." header value
 * @param {Buffer} rawBody - Raw request body buffer (set by express.json verify callback)
 * @returns {boolean}
 */
export const verifySignature = (signature, rawBody) => {
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
        crypto.createHmac("sha256", webhookSecret)
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