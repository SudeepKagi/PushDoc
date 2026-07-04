import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

const repositoriesPath = path.join(
    process.cwd(),
    "..",
    "temp",
    "repositories"
);

if (!fs.existsSync(repositoriesPath)) {
    fs.mkdirSync(repositoriesPath, {
        recursive: true,
    });
}

export const cloneRepository = async (
    cloneUrl,
    repositoryName
) => {

    const repositoryPath = path.join(
        repositoriesPath,
        repositoryName
    );

    if (fs.existsSync(repositoryPath)) {
        fs.rmSync(repositoryPath, {
            recursive: true,
            force: true,
        });
    }

    const git = simpleGit();

    console.log("📥 Cloning repository...");

    await git.clone(
        cloneUrl,
        repositoryPath
    );

    console.log("✅ Clone completed");

    return repositoryPath;

};

export const createAuthenticatedCloneUrl = (
    cloneUrl,
    token
) => {

    return cloneUrl.replace(
        "https://",
        `https://x-access-token:${token}@`
    );

};

export const commitChanges = async (
    repositoryPath
) => {

    const git = simpleGit(repositoryPath);

    await git.add("README.md");

    const status =
        await git.status();

    if (status.files.length === 0) {

        console.log(
            "ℹ️ No README changes detected."
        );

        return false;

    }

    await git.commit(
        "docs: update README using PushDoc 🤖"
    );

    return true;

};

export const pushChanges = async (
    repositoryPath,
    branch
) => {

    const git =
        simpleGit(repositoryPath);

    const branchName =
        branch.replace(
            "refs/heads/",
            ""
        );

    await git.push(
        "origin",
        branchName
    );

};