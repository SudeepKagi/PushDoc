from __future__ import annotations

from pathlib import PurePosixPath
from fnmatch import fnmatchcase

DEFAULT_IGNORED_DIRECTORIES = frozenset({
    ".git", ".venv", "venv", "__pycache__", "node_modules", "target", "vendor", "dist", "build",
    ".next", ".turbo", "coverage",
})
IGNORED_FILENAMES = frozenset({"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "poetry.lock", "Cargo.lock"})
MAX_FILE_BYTES = 512 * 1024


class GitIgnore:
    """Small, deterministic root .gitignore matcher for snapshot filtering."""

    def __init__(self, content: str) -> None:
        self.patterns: list[tuple[str, bool, bool, bool]] = []
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            include = line.startswith("!")
            pattern = line[1:] if include else line
            anchored, directory = pattern.startswith("/"), pattern.endswith("/")
            pattern = pattern.strip("/")
            if pattern:
                self.patterns.append((pattern, include, anchored, directory))

    def ignores(self, path: PurePosixPath) -> bool:
        ignored = False
        value = str(path)
        for pattern, include, anchored, directory in self.patterns:
            if directory:
                matched = any(
                    fnmatchcase("/".join(path.parts[:index]), pattern)
                    if anchored
                    else fnmatchcase(part, pattern)
                    for index, part in enumerate(path.parts, start=1)
                )
            elif anchored or "/" in pattern:
                matched = fnmatchcase(value, pattern)
            else:
                matched = any(fnmatchcase(part, pattern) for part in path.parts)
            if matched:
                ignored = not include
        return ignored


def should_include(path: PurePosixPath, content: bytes, gitignore: GitIgnore | None = None) -> bool:
    if any(part in DEFAULT_IGNORED_DIRECTORIES for part in path.parts):
        return False
    if gitignore and gitignore.ignores(path):
        return False
    if path.name in IGNORED_FILENAMES or len(content) > MAX_FILE_BYTES or b"\x00" in content[:8192]:
        return False
    if len(content) > 1024 and len(set(content)) < 4:
        return False
    return True
