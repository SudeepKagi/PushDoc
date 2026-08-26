import { getGitHubApp as getConfiguredGitHubApp } from "../config/github.js";
import { GitHubError } from "../utils/errors.js";

const githubApp = () => {
    try {
        return getConfiguredGitHubApp();
    } catch {
        throw new GitHubError("GitHub App is not configured", 503);
    }
};

export const getGitHubApp = async () => {
    // Simply check that octokit is initialized
    if (!githubApp()?.octokit) {
        throw new GitHubError("GitHub App not initialized properly");
    }
    return {
        success: true
    };
};

export const getInstallUrl = (state) => {
    const appName = process.env.GITHUB_APP_NAME;
    if (!appName) {
        throw new GitHubError("GITHUB_APP_NAME environment variable is not configured");
    }
    const installUrl = new URL(
        `https://github.com/apps/${appName}/installations/new`
    );
    installUrl.searchParams.append("state", state);
    return installUrl.toString();
};

export const getInstallation = async (installationId) => {
    try {
        const response = await githubApp().octokit.request(
            "GET /app/installations/{installation_id}",
            {
                installation_id: Number(installationId),
            }
        );
        return response.data;
    } catch (error) {
        throw new GitHubError(`Failed to fetch GitHub installation details: ${error.message}`, error.status || 502);
    }
};

export const getInstallationRepositories = async (installationId) => {
    try {
        const id = Number(installationId);
        const installationOctokit =
            await githubApp().getInstallationOctokit(
                id
            );

        if (typeof installationOctokit.paginate === "function") {
            const repositories = await installationOctokit.paginate(
                "GET /installation/repositories",
                { per_page: 100 }
            );
            return repositories;
        }

        const res = await installationOctokit.request(
            "GET /installation/repositories",
            { per_page: 100 }
        );
        return res.data?.repositories || [];
    } catch (error) {
        throw new GitHubError(`Failed to fetch installation repositories: ${error.message}`, error.status || 502);
    }
};

export const getInstallationAccessToken = async (
    installationId
) => {
    try {
        const response = await githubApp().octokit.request(
            "POST /app/installations/{installation_id}/access_tokens",
            {
                installation_id: Number(installationId),
            }
        );
        return response.data.token;
    } catch (error) {
        throw new GitHubError(`Failed to generate installation access token: ${error.message}`, error.status || 502);
    }
};

export const getRepositoryDefaultBranchAndCommit = async (installationId, owner, repo) => {
    try {
        const installationOctokit = await githubApp().getInstallationOctokit(installationId);
        const repoResponse = await installationOctokit.request(
            "GET /repos/{owner}/{repo}",
            {
                owner,
                repo,
            }
        );
        const defaultBranch = repoResponse.data.default_branch || "main";

        const refResponse = await installationOctokit.request(
            "GET /repos/{owner}/{repo}/git/ref/{ref}",
            {
                owner,
                repo,
                ref: `heads/${defaultBranch}`,
            }
        );
        return {
            branch: `refs/heads/${defaultBranch}`,
            commitSha: refResponse.data.object.sha,
        };
    } catch (error) {
        throw new GitHubError(`Failed to fetch repository details from GitHub: ${error.message}`, error.status || 502);
    }
};

export const getRepositoryReadme = async (installationId, owner, repo) => {
    try {
        const installationOctokit = await githubApp().getInstallationOctokit(installationId);
        const response = await installationOctokit.request(
            "GET /repos/{owner}/{repo}/readme",
            {
                owner,
                repo,
            }
        );
        if (response.data && response.data.content) {
            const buffer = Buffer.from(response.data.content, "base64");
            return {
                content: buffer.toString("utf8"),
                name: response.data.name,
                path: response.data.path,
            };
        }
        return { content: "" };
    } catch (error) {
        // Return empty string if repository has no README on GitHub
        return { content: "", error: error.message };
    }
};
