import path from "path";

export const scoreFile = (
    file
) => {

    const name =
        path.basename(file.path);

    if (
        name === "package.json"
    ) {

        return {
            score: 100,
            reason: "package.json",
        };

    }

    if (
        name === "README.md"
    ) {

        return {
            score: 95,
            reason: "existing README",
        };

    }

    if (
        name === "Dockerfile"
    ) {

        return {
            score: 95,
            reason: "docker",
        };

    }

    if (
        file.path.includes("routes")
    ) {

        return {
            score: 90,
            reason: "routes",
        };

    }

    if (
        file.path.includes("controllers")
    ) {

        return {
            score: 88,
            reason: "controllers",
        };

    }

    if (
        file.path.includes("models")
    ) {

        return {
            score: 86,
            reason: "models",
        };

    }

    if (
        file.path.includes("services")
    ) {

        return {
            score: 80,
            reason: "services",
        };

    }

    if (
        file.path.includes("middleware")
    ) {

        return {
            score: 78,
            reason: "middleware",
        };

    }

    return {

        score: 50,

        reason: "general",

    };

};