from __future__ import annotations

from pathlib import PurePosixPath

EXTENSIONS = {
    ".py": "python", ".js": "javascript", ".jsx": "javascript", ".ts": "typescript", ".tsx": "tsx",
    ".java": "java", ".go": "go", ".rs": "rust", ".c": "c", ".h": "c", ".cpp": "cpp",
    ".cs": "c_sharp", ".php": "php", ".rb": "ruby", ".kt": "kotlin", ".swift": "swift",
    ".md": "markdown", ".yaml": "yaml", ".yml": "yaml", ".json": "json", ".toml": "toml",
}
SHEBANGS = {"python": "python", "node": "javascript", "bash": "bash", "sh": "bash"}
MANIFESTS = {"package.json": "json", "pyproject.toml": "toml", "go.mod": "go", "Cargo.toml": "toml"}


def detect_language(path: PurePosixPath, content: str) -> str:
    if path.name in MANIFESTS:
        return MANIFESTS[path.name]
    if path.suffix.lower() in EXTENSIONS:
        return EXTENSIONS[path.suffix.lower()]
    first_line = content.partition("\n")[0].lower()
    if first_line.startswith("#!"):
        for interpreter, language in SHEBANGS.items():
            if interpreter in first_line:
                return language
    return "unknown"
