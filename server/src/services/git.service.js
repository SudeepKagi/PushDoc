import simpleGit from "simple-git";
import { GitError, ValidationError } from "../utils/errors.js";

/**
 * Sanitizes and validates local repository paths to prevent path traversal.
 */
const validateRepoPath = (repositoryPath) => {
    if (!repositoryPath) {
        throw new ValidationError("Repository path is required");
    }
    // Simple path traversal check
    if (repositoryPath.includes("..") || repositoryPath.includes("\0")) {
        throw new ValidationError(`Malicious path traversal detected: ${repositoryPath}`);
    }
};

/**
 * Redacts sensitive credentials (e.g. GitHub access tokens) from git error messages.
 */
const handleGitError = (error, token) => {
    let msg = error.message || "Unknown Git error";
    if (token) {
        // Redact the token from the clone URL pattern
        const tokenRegex = new RegExp(token, "g");
        msg = msg.replace(tokenRegex, "REDACTED_TOKEN");
        msg = msg.replace(/x-access-token:[^@]+@/g, "x-access-token:REDACTED@");
    }
    return new GitError(msg);
};

export const cloneRepository = async (
    cloneUrl,
    repositoryPath,
    token
) => {
    validateRepoPath(repositoryPath);
    try {
        const git = simpleGit();
        await git.clone(
            cloneUrl,
            repositoryPath
        );
        return repositoryPath;
    } catch (error) {
        throw handleGitError(error, token);
    }
};

export const createAuthenticatedCloneUrl = (
    cloneUrl,
    token
) => {
    if (!cloneUrl) {
        throw new ValidationError("Clone URL is required");
    }
    if (!token) {
        throw new ValidationError("Access token is required for authentication");
    }
    return cloneUrl.replace(
        "https://",
        `https://x-access-token:${token}@`
    );
};

export const commitChanges = async (
    repositoryPath
) => {
    validateRepoPath(repositoryPath);
    try {
        const git = simpleGit(repositoryPath);

        // Configure git identity for environments without a global git config
        await git.addConfig("user.name", "PushDoc");
        await git.addConfig("user.email", "bot@pushdoc.app");

        await git.add(".");

        const status = await git.status();

        if (status.files.length === 0) {
            return false;
        }

        await git.commit(
            "docs: update README.md by PushDoc"
        );

        return true;
    } catch (error) {
        throw handleGitError(error);
    }
};

export const pushChanges = async (
    repositoryPath,
    branch
) => {
    validateRepoPath(repositoryPath);
    if (!branch) {
        throw new ValidationError("Branch name is required for pushing changes");
    }

    // Sanitize branch name to prevent execution injection
    const branchName = branch
        .replace("refs/heads/", "")
        .trim();

    // Verify it doesn't contain forbidden characters for git branch names
    if (/[\s;`"'$&<>|]/g.test(branchName)) {
        throw new ValidationError(`Invalid branch name format: ${branchName}`);
    }

    try {
        const git = simpleGit(repositoryPath);
        await git.push(
            "origin",
            branchName
        );
    } catch (error) {
        throw handleGitError(error);
    }
};