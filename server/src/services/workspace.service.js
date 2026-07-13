import fs from "fs";
import path from "path";
import { config } from "../config/app.config.js";
import { WorkspaceError, ValidationError } from "../utils/errors.js";

const WORKSPACE_ROOT = config.workspace.root;

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

function createWorkspace(jobId) {
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

function getRepositoryPath(
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

function cleanupWorkspace(jobId) {
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

export {
    createWorkspace,
    getRepositoryPath,
    cleanupWorkspace,
};