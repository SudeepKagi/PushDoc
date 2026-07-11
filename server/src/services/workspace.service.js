import fs from "fs";
import path from "path";

const WORKSPACE_ROOT = path.join(
    process.cwd(),
    "temp",
    "workspaces"
);

if (!fs.existsSync(WORKSPACE_ROOT)) {
    fs.mkdirSync(WORKSPACE_ROOT, {
        recursive: true,
    });
}

function createWorkspace(jobId) {

    const workspacePath = path.join(
        WORKSPACE_ROOT,
        jobId.toString()
    );

    fs.mkdirSync(workspacePath, {
        recursive: true,
    });

    return workspacePath;
}

function getRepositoryPath(
    jobId,
    repositoryName
) {

    return path.join(
        WORKSPACE_ROOT,
        jobId.toString(),
        repositoryName
    );

}

function cleanupWorkspace(jobId) {

    const workspacePath = path.join(
        WORKSPACE_ROOT,
        jobId.toString()
    );

    if (fs.existsSync(workspacePath)) {

        fs.rmSync(workspacePath, {
            recursive: true,
            force: true,
        });

    }

}

export {
    createWorkspace,
    getRepositoryPath,
    cleanupWorkspace,
};