export const githubCallback = async (code) => {

    const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
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
        "https://api.github.com/user",
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/json",
            },
        }
    );

    const user = await userResponse.json();

    return user;
};