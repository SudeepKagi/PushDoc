import fs from "fs";
import path from "path";
import { config } from "../config/app.config.js";
import { WorkspaceError, ValidationError } from "../utils/errors.js";
import * as logger from "./logger.service.js";

const WORKSPACE_ROOT = config.workspace.root;

// Maximum age of a stale workspace before it gets force-cleaned (30 minutes)
const STALE_WORKSPACE_MAX_AGE_MS = 30 * 60 * 1000;

if (!fs.existsSync(WORKSPACE_ROOT)) {
    try {
        fs.mkdirSync(WORKSPACE_ROOT, {
            recursive: true,
        });
    } catch (err) {
        throw new WorkspaceError(`Failed to initialize workspace root folder: ${err.message}`);
    }
}

const validateJobId = (jobId) => {
    if (!jobId) {
        throw new ValidationError("Job ID is required for workspace operations");
    }
    const cleanId = jobId.toString().trim();
    if (!/^[a-zA-Z0-9\-_]+$/.test(cleanId)) {
        throw new ValidationError(`Invalid Job ID format: ${cleanId}`);
    }
    return cleanId;
};

const validateRepositoryName = (repositoryName) => {
    if (!repositoryName) {
        throw new ValidationError("Repository name is required for workspace operations");
    }
    if (repositoryName.includes("..") || repositoryName.includes("/") || repositoryName.includes("\\") || repositoryName.includes("\0")) {
        throw new ValidationError(`Invalid repository name format for path security: ${repositoryName}`);
    }
    return repositoryName;
};

export function createWorkspace(jobId) {
    const cleanId = validateJobId(jobId);
    const workspacePath = path.join(
        WORKSPACE_ROOT,
        cleanId
    );

    try {
        fs.mkdirSync(workspacePath, {
            recursive: true,
        });
        return workspacePath;
    } catch (err) {
        throw new WorkspaceError(`Failed to create workspace directory for job ${cleanId}: ${err.message}`);
    }
}

export function getRepositoryPath(
    jobId,
    repositoryName
) {
    const cleanId = validateJobId(jobId);
    const cleanRepoName = validateRepositoryName(repositoryName);

    return path.join(
        WORKSPACE_ROOT,
        cleanId,
        cleanRepoName
    );
}

export function cleanupWorkspace(jobId) {
    const cleanId = validateJobId(jobId);
    const workspacePath = path.join(
        WORKSPACE_ROOT,
        cleanId
    );

    try {
        if (fs.existsSync(workspacePath)) {
            fs.rmSync(workspacePath, {
                recursive: true,
                force: true,
            });
        }
    } catch (err) {
        throw new WorkspaceError(`Failed to cleanup workspace directory for job ${cleanId}: ${err.message}`);
    }
}

/**
 * Scans the workspace root and deletes any directories older than
 * STALE_WORKSPACE_MAX_AGE_MS. Called at server startup to recover
 * from previous unclean shutdowns.
 */
export function purgeStaleWorkspaces() {
    if (!fs.existsSync(WORKSPACE_ROOT)) return;

    let purged = 0;
    try {
        const entries = fs.readdirSync(WORKSPACE_ROOT, { withFileTypes: true });
        const now = Date.now();

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const fullPath = path.join(WORKSPACE_ROOT, entry.name);
            try {
                const stat = fs.statSync(fullPath);
                const ageMs = now - stat.mtimeMs;

                if (ageMs > STALE_WORKSPACE_MAX_AGE_MS) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    purged++;
                    logger.info(`Purged stale workspace: ${entry.name} (age: ${Math.round(ageMs / 60000)}m)`);
                }
            } catch (err) {
                logger.warn(`Could not stat workspace entry ${entry.name}: ${err.message}`);
            }
        }

        if (purged > 0) {
            logger.success(`Workspace purge complete — removed ${purged} stale workspace(s)`);
        }
    } catch (err) {
        logger.warn(`Stale workspace purge failed: ${err.message}`);
    }
}