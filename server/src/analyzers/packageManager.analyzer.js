import fs from "fs";
import path from "path";

export const detectPackageManager = (repositoryPath) => {

    if (
        fs.existsSync(
            path.join(repositoryPath, "pnpm-lock.yaml")
        )
    ) {
        return "pnpm";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "yarn.lock")
        )
    ) {
        return "yarn";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "package-lock.json")
        )
    ) {
        return "npm";
    }

    if (
        fs.existsSync(
            path.join(repositoryPath, "bun.lockb")
        )
    ) {
        return "bun";
    }

    return "Unknown";

};