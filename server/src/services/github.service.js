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

    const installation = await githubApp.octokit.rest.apps.getInstallation({
        installation_id: Number(installationId),
    });

    return installation.data;
};