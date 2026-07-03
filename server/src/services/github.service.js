import githubApp from "../config/github.js";

export const getGitHubApp = async () => {
    console.log(githubApp);

    return {
        success: true
    };
};

export const getInstallUrl = (state) => {

    const installUrl = new URL(
        `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new`
    );

    installUrl.searchParams.append("state", state);

    return installUrl.toString();
};

export const getInstallation = async (installationId) => {

    const response = await githubApp.octokit.request(
        "GET /app/installations/{installation_id}",
        {
            installation_id: Number(installationId),
        }
    );

    return response.data;
};

export const getInstallationRepositories = async (installationId) => {

    const installationOctokit =
        await githubApp.getInstallationOctokit(
            installationId
        );

    const response = await installationOctokit.request(
        "GET /installation/repositories"
    );

    return response.data.repositories;

};

export const getInstallationAccessToken = async (
    installationId
) => {

    const installationOctokit =
        await githubApp.getInstallationOctokit(
            installationId
        );

    const authentication =
        await installationOctokit.auth();

    return authentication.token;

};