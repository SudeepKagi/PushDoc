import * as userService from "./user.service.js";
import * as jwtService from "./jwt.service.js";
import { GITHUB_URLS } from "../constants/github.constants.js";

export const githubLogin = () => {

    const githubAuthURL = new URL(
        GITHUB_URLS.OAUTH_AUTHORIZE
    );

    githubAuthURL.searchParams.append(
        "client_id",
        process.env.GITHUB_CLIENT_ID
    );

    githubAuthURL.searchParams.append(
        "redirect_uri",
        process.env.GITHUB_REDIRECT_URI
    );

    githubAuthURL.searchParams.append(
        "state",
        "pushdoc123"
    );

    return githubAuthURL.toString();
};

export const githubCallback = async (code) => {

    const tokenResponse = await fetch(
        GITHUB_URLS.OAUTH_ACCESS_TOKEN,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        }
    );

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch(
        GITHUB_URLS.USER_API,
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/json",
            },
        }
    );

    const githubUser = await userResponse.json();

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