import * as userService from "./user.service.js";
import * as jwtService from "./jwt.service.js";
import { GITHUB_URLS } from "../constants/github.constants.js";
import { config } from "../config/app.config.js";
import { GitHubError } from "../utils/errors.js";

export const githubLogin = () => {
    if (!config.github.clientId) {
        throw new GitHubError("GitHub Client ID is not configured");
    }

    const githubAuthURL = new URL(
        GITHUB_URLS.OAUTH_AUTHORIZE
    );

    githubAuthURL.searchParams.append(
        "client_id",
        config.github.clientId
    );

    githubAuthURL.searchParams.append(
        "redirect_uri",
        config.github.redirectUri
    );

    // Using a configuration-backed state verification code
    githubAuthURL.searchParams.append(
        "state",
        config.github.webhookSecret ? config.github.webhookSecret.substring(0, 16) : "pushdoc_sec_state"
    );

    return githubAuthURL.toString();
};

export const githubCallback = async (code) => {
    if (!config.github.clientId || !config.github.clientSecret) {
        throw new GitHubError("GitHub OAuth credentials are not configured");
    }

    let tokenData;
    try {
        const tokenResponse = await fetch(
            GITHUB_URLS.OAUTH_ACCESS_TOKEN,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_id: config.github.clientId,
                    client_secret: config.github.clientSecret,
                    code,
                }),
            }
        );

        if (!tokenResponse.ok) {
            throw new GitHubError(`GitHub token exchange responded with status ${tokenResponse.status}`);
        }

        tokenData = await tokenResponse.json();
    } catch (err) {
        throw new GitHubError(`GitHub token request failed: ${err.message}`);
    }

    if (tokenData.error) {
        throw new GitHubError(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    if (!tokenData.access_token) {
        throw new GitHubError("GitHub OAuth response did not return an access token");
    }

    let githubUser;
    try {
        const userResponse = await fetch(
            GITHUB_URLS.USER_API,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!userResponse.ok) {
            throw new GitHubError(`GitHub user fetch responded with status ${userResponse.status}`);
        }

        githubUser = await userResponse.json();
    } catch (err) {
        throw new GitHubError(`Failed to fetch GitHub user details: ${err.message}`);
    }

    const savedUser = await userService.createOrUpdateUser(
        githubUser,
        tokenData.access_token
    );

    const token = jwtService.generateToken(savedUser);

    const userRes = {
        id: savedUser._id,
        githubId: savedUser.githubId,
        username: savedUser.username,
        displayName: savedUser.displayName,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl,
        provider: savedUser.provider,
    };

    return {
        user: userRes,
        token,
    };
};