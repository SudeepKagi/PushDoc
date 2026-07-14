import simpleGit from "simple-git";
import { GitError, ValidationError } from "../utils/errors.js";

const validateRepoPath = (repositoryPath) => {
    if (!repositoryPath) {
        throw new ValidationError("Repository path is required");
    }
    if (repositoryPath.includes("..") || repositoryPath.includes("\0")) {
        throw new ValidationError(`Malicious path traversal detected: ${repositoryPath}`);
    }
};

const handleGitError = (error, token) => {
    let msg = error.message || "Unknown Git error";
    if (token) {
        const tokenRegex = new RegExp(token, "g");
        msg = msg.replace(tokenRegex, "REDACTED_TOKEN");
        msg = msg.replace(/x-access-token:[^@]+@/g, "x-access-token:REDACTED@");
    }
    return new GitError(msg);
};

export const cloneRepository = async (
    cloneUrl,
    repositoryPath,
    token,
    branch
) => {
    validateRepoPath(repositoryPath);
    try {
        const git = simpleGit();
        // Shallow clone: only fetch the tip commit of the target branch.
        // This keeps disk usage minimal (5–20 MB vs hundreds of MB for full clones)
        // which is critical on ephemeral cloud filesystems (Render, Railway, Fly).
        const cloneArgs = [
            "--depth", "1",
            "--no-tags",
            "--single-branch",
        ];
        if (branch) {
            cloneArgs.push("--branch", branch.replace("refs/heads/", ""));
        }
        await git.clone(cloneUrl, repositoryPath, cloneArgs);
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

        await git.addConfig("user.name", "PushDoc");
        await git.addConfig("user.email", "bot@pushdoc.app");

        await git.add("README.md");

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

    const branchName = branch
        .replace("refs/heads/", "")
        .trim();

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