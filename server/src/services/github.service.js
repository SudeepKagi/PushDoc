import githubApp from "../config/github.js";

export const getGitHubApp = async () => {
    console.log(githubApp);

    return {
        success: true
    };
};