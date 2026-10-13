import { promises as fs } from "fs";
import path from "path";
import { gzipSync } from "zlib";

const MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;
const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", "coverage", ".venv", "venv"]);

const writeString = (buffer, value, offset, length) => buffer.write(value.slice(0, length), offset, length, "utf8");
const writeOctal = (buffer, value, offset, length) => writeString(buffer, value.toString(8).padStart(length - 1, "0"), offset, length);

const tarHeader = (name, size) => {
    const header = Buffer.alloc(512);
    writeString(header, name, 0, 100);
    writeOctal(header, 0o644, 100, 8);
    writeOctal(header, 0, 108, 8);
    writeOctal(header, 0, 116, 8);
    writeOctal(header, size, 124, 12);
    writeOctal(header, Math.floor(Date.now() / 1000), 136, 12);
    header.fill(0x20, 148, 156);
    header[156] = "0".charCodeAt(0);
    writeString(header, "ustar", 257, 6);
    writeString(header, "00", 263, 2);
    const checksum = header.reduce((total, byte) => total + byte, 0);
    writeString(header, `${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8);
    return header;
};

const filesUnder = async (root, current = root) => {
    const entries = await fs.readdir(current, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRECTORIES.has(entry.name)) files.push(...await filesUnder(root, path.join(current, entry.name)));
        } else if (entry.isFile()) {
            files.push(path.join(current, entry.name));
        }
    }
    return files;
};

/** Creates a bounded gzip-tar snapshot without shelling out or following symlinks. */
export const createSnapshot = async (repositoryPath) => {
    const parts = [];
    let uncompressedSize = 0;
    for (const absolutePath of await filesUnder(repositoryPath)) {
        const relativePath = path.relative(repositoryPath, absolutePath).split(path.sep).join("/");
        const content = await fs.readFile(absolutePath);
        if (content.includes(0) || relativePath.length > 100) continue;
        const padding = Buffer.alloc((512 - (content.length % 512)) % 512);
        parts.push(tarHeader(relativePath, content.length), content, padding);
        uncompressedSize += 512 + content.length + padding.length;
        if (uncompressedSize > MAX_ARCHIVE_BYTES * 4) throw new Error("Repository snapshot exceeds the extraction limit.");
    }
    const archive = gzipSync(Buffer.concat([...parts, Buffer.alloc(1024)]));
    if (archive.length > MAX_ARCHIVE_BYTES) throw new Error("Repository snapshot exceeds the 25 MB payload limit.");
    return archive.toString("base64");
};
