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

    if (fs.existsSync(repositoryPath)) {
        fs.rmSync(repositoryPath, {
            recursive: true,
            force: true,
        });
    }

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

export const getInstallationAccessToken = async (
    installationId
) => {

    const installationOctokit =
        await githubApp.getInstallationOctokit(
            installationId
        );

    const authentication =
        await installationOctokit.auth({
            type: "installation",
        });

    return authentication.token;

};