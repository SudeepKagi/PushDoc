import fs from "fs";
import path from "path";

export const detectLanguage = (repositoryPath) => {

    if (
        fs.existsSync(
            path.join(repositoryPath, "tsconfig.json")
        )
    ) {
        return "TypeScript";
    }

    return "JavaScript";

};