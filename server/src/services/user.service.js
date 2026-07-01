import User from "../models/user.model.js";

export const createOrUpdateUser = async (githubUser, accessToken) => {

    const user = await User.findOneAndUpdate(
        {
            githubId: githubUser.id,
        },
        {
            githubId: githubUser.id,
            username: githubUser.login,
            displayName: githubUser.name,
            email: githubUser.email,
            avatarUrl: githubUser.avatar_url,
            githubAccessToken: accessToken,
            provider: "github",
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );

    return user;
};