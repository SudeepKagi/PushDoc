import fs from "fs";
import path from "path";

export const writeReadme = async (
    repositoryPath,
    markdown
) => {

    const readmePath = path.join(
        repositoryPath,
        "README.md"
    );

    fs.writeFileSync(
        readmePath,
        markdown,
        "utf8"
    );

    return readmePath;

};