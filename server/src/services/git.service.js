import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

const repositoriesPath = path.join(
    process.cwd(),
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

    const git = simpleGit();

    await git.clone(
        cloneUrl,
        repositoryPath
    );

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