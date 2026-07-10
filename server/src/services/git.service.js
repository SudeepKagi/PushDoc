import simpleGit from "simple-git";

export const cloneRepository = async (
    cloneUrl,
    repositoryPath
) => {

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

export const commitChanges = async (
    repositoryPath
) => {

    const git =
        simpleGit(repositoryPath);

    await git.add(".");

    const status =
        await git.status();

    if (status.files.length === 0) {
        return false;
    }

    await git.commit(
        "docs: update README.md by PushDoc"
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