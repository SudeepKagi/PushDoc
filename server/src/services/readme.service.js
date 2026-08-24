import fs from "fs";
import path from "path";

export const readExistingReadme = (repositoryPath) => {
    try {
        if (!fs.existsSync(repositoryPath)) return "";
        const files = fs.readdirSync(repositoryPath);
        // Match readme.md, README.MD, README.markdown, readme, etc.
        const readmeFile = files.find(f => /^readme(\.md|\.markdown)?$/i.test(f));
        if (readmeFile) {
            return fs.readFileSync(path.join(repositoryPath, readmeFile), "utf8");
        }
        return "";
    } catch (err) {
        return "";
    }
};

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