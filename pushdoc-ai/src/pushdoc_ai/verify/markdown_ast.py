from __future__ import annotations

import re
from pathlib import PurePosixPath

from markdown_it import MarkdownIt


def markdown_violations(markdown: str, known_paths: set[PurePosixPath] | None = None) -> list[str]:
    violations: list[str] = []
    if len(re.findall(r"(?m)^\s*(```|~~~)", markdown)) % 2:
        violations.append("BLOCKING: unbalanced code fence")
    tokens = MarkdownIt("commonmark").parse(markdown)
    headings = [token.content.strip().lower() for token in tokens if token.type == "inline" and token.map and markdown.splitlines()[token.map[0]].startswith("#")]
    if len(headings) != len(set(headings)):
        violations.append("BLOCKING: duplicate heading")
    for token in tokens:
        if token.type != "inline" or not token.children:
            continue
        for child in token.children:
            if child.type == "link_open":
                href = child.attrGet("href") or ""
                if href and not href.startswith(("#", "http://", "https://", "mailto:")) and known_paths is not None:
                    if PurePosixPath(href.split("#", 1)[0]) not in known_paths:
                        violations.append(f"BLOCKING: unresolved relative link {href}")
    return violations
