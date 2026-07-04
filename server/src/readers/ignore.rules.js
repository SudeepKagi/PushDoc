import path from "path";

/**
 * Directories that should never be scanned.
 */
export const IGNORE_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".github-cache",
    ".next",
    ".turbo",
    ".vercel",
    ".vscode",
    ".idea",
    "dist",
    "build",
    "coverage",
    "temp",
    "uploads",
    "logs",
]);

/**
 * Files that are always useful for AI context.
 */
export const IMPORTANT_FILES = new Set([
    "package.json",
    "README.md",
    "Dockerfile",
    "docker-compose.yml",
    ".env.example",
    ".env.sample",
    ".env.template",
    "render.yaml",
    "vercel.json",
    "netlify.toml",
]);

/**
 * Directories worth scanning.
 */
export const IMPORTANT_DIRECTORIES = new Set([
    "src",
    "routes",
    "controllers",
    "models",
    "middlewares",
    "middleware",
    "services",
    "config",
    "views",
    "utils",
    "lib",
    "helpers",
    "database",
    "schemas",
    "docs",
    ".github",
]);

/**
 * File extensions supported by the reader.
 */
export const SUPPORTED_EXTENSIONS = new Set([
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".md",
    ".yaml",
    ".yml",
    ".html",
    ".css",
    ".scss",
    ".sass",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".php",
    ".cs",
    ".cpp",
    ".c",
]);

/**
 * Maximum file size (50 KB)
 */
export const MAX_FILE_SIZE = 50 * 1024;

/**
 * Maximum lines read from one file.
 */
export const MAX_LINES = 300;

/**
 * Maximum characters read from one file.
 */
export const MAX_CHARACTERS = 12000;

/**
 * Returns true if directory should be ignored.
 */
export const shouldIgnoreDirectory = (directoryName) => {
    return IGNORE_DIRECTORIES.has(directoryName);
};

/**
 * Returns true if file is important.
 */
export const isImportantFile = (fileName) => {
    return IMPORTANT_FILES.has(fileName);
};

/**
 * Returns true if directory is important.
 */
export const isImportantDirectory = (directoryName) => {
    return IMPORTANT_DIRECTORIES.has(directoryName);
};

/**
 * Returns true if extension is supported.
 */
export const isSupportedExtension = (filePath) => {
    const extension = path.extname(filePath);
    return SUPPORTED_EXTENSIONS.has(extension);
};