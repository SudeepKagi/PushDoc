import * as userService from "./user.service.js";
import * as jwtService from "./jwt.service.js";
import { GITHUB_URLS } from "../constants/github.constants.js";
import { config } from "../config/app.config.js";
import { GitHubError, ValidationError } from "../utils/errors.js";
import crypto from "crypto";
import connection from "../queue/connection.js";

/**
 * Wraps a Redis command promise with a hard timeout.
 * Prevents a mid-reconnect ioredis command from hanging an HTTP response
 * indefinitely when maxRetriesPerRequest kicks in during a reconnect window.
 */
const redisWithTimeout = (promise, ms = 5_000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Redis call timed out after ${ms}ms`)), ms)
        ),
    ]);

export const githubLogin = async () => {
    if (!config.github.clientId) {
        throw new GitHubError("GitHub Client ID is not configured");
    }

    // Generate a cryptographically random CSRF nonce, store it in Redis for 10 min
    const state = crypto.randomBytes(16).toString("hex");
    const redis = connection;
    await redisWithTimeout(redis.set(`oauth_state:${state}`, "1", "EX", 600));

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

    githubAuthURL.searchParams.append(
        "state",
        state
    );

    return githubAuthURL.toString();
};

export const githubCallback = async (code, state) => {
    if (!config.github.clientId || !config.github.clientSecret) {
        throw new GitHubError("GitHub OAuth credentials are not configured");
    }

    // Verify CSRF state nonce
    if (!state) {
        throw new ValidationError("Missing OAuth state parameter");
    }
    const redis = connection;
    const stored = await redisWithTimeout(redis.get(`oauth_state:${state}`));
    if (!stored) {
        throw new ValidationError("Invalid or expired OAuth state. Please try logging in again.");
    }
    await redisWithTimeout(redis.del(`oauth_state:${state}`));
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