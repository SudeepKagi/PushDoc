export const githubLogin = () => {

    const githAuthURL = new URL(
        "https://github.com/login/oauth/authorize"
    );

    githAuthURL.searchParams.append(
        "client_id",
        process.env.GITHUB_CLIENT_ID
    )

    githAuthURL.searchParams.append(
        "redirect_uri",
        "http://localhost:3000/auth/github/callback"
    )

    githAuthURL.searchParams.append(
        "state",
        "pushdoc123"
    )

    return githAuthURL.toString();
};