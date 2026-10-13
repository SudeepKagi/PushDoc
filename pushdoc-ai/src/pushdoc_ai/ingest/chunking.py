from __future__ import annotations

from dataclasses import dataclass
from pathlib import PurePosixPath
import ast

from pushdoc_ai.ingest.snapshot import SnapshotFile

MAX_CHUNK_TOKENS = 512
OVERLAP_TOKENS = 64
OUTLINE_THRESHOLD_BYTES = 128 * 1024
SYMBOL_NODE_TYPES = frozenset({
    "function_definition", "function_declaration", "method_definition", "method_declaration",
    "class_definition", "class_declaration", "interface_declaration", "struct_item", "impl_item",
})


@dataclass(frozen=True)
class Chunk:
    id: str
    path: PurePosixPath
    language: str
    symbol: str
    content: str
    source_start: int
    source_end: int


def _token_offset(text: str, start: int, count: int) -> int:
    """Approximate token limits without splitting Unicode code points."""
    words = list(__import__("re").finditer(r"\S+", text[start:]))
    if len(words) <= count:
        return len(text)
    return start + words[count].start()


def _symbol_name(node, source: bytes) -> str:
    name = node.child_by_field_name("name")
    if name is not None:
        return source[name.start_byte:name.end_byte].decode("utf-8", errors="replace")
    return node.type


def _byte_to_character_offset(source: bytes, offset: int) -> int:
    return len(source[:offset].decode("utf-8", errors="replace"))


def _tree_sitter_spans(file: SnapshotFile) -> list[tuple[str, int, int]]:
    try:
        from tree_sitter_language_pack import get_parser

        parser = get_parser(file.language)
        source = file.content.encode("utf-8")
        tree = parser.parse(source)
        root = tree.root_node
        candidates = [node for node in root.children if node.type in SYMBOL_NODE_TYPES]
        if not candidates:
            candidates = [node for node in root.children if node.is_named]
        return [
            (
                _symbol_name(node, source),
                _byte_to_character_offset(source, node.start_byte),
                _byte_to_character_offset(source, node.end_byte),
            )
            for node in candidates
        ]
    except (ImportError, ValueError, AttributeError, OSError):
        return _python_ast_spans(file)


def _python_ast_spans(file: SnapshotFile) -> list[tuple[str, int, int]]:
    """Offline parser fallback when a Tree-sitter grammar cannot be loaded."""
    if file.language != "python":
        return []
    try:
        tree = ast.parse(file.content)
    except SyntaxError:
        return []
    line_offsets = [0]
    for line in file.content.splitlines(keepends=True):
        line_offsets.append(line_offsets[-1] + len(line))
    spans = []
    for node in tree.body:
        if not isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)) or not node.end_lineno:
            continue
        start = line_offsets[node.lineno - 1] + node.col_offset
        end = line_offsets[node.end_lineno - 1] + node.end_col_offset
        while end > start and file.content[end - 1] in "\r\n":
            end -= 1
        spans.append((node.name, start, end))
    return spans


def _structured_spans(file: SnapshotFile) -> list[tuple[str, int, int]]:
    if file.language not in {"markdown", "yaml", "json", "toml"}:
        return []
    if file.language == "markdown":
        starts = [match.start() for match in __import__("re").finditer(r"(?m)^#{1,6}\s+", file.content)]
        return [
            ("section", start, starts[index + 1] if index + 1 < len(starts) else len(file.content))
            for index, start in enumerate(starts)
        ]
    if file.language == "yaml":
        pattern = r"(?m)^(?![ \t#-])([A-Za-z0-9_.-]+):"
    elif file.language == "toml":
        pattern = r"(?m)^\s*(?:\[\[?[^\]]+\]?\]|[A-Za-z0-9_.-]+\s*=)"
    else:
        pattern = r'(?m)^\s*"[^"\\]+"\s*:'
    starts = [match.start() for match in __import__("re").finditer(pattern, file.content)]
    return [
        ("entry", start, starts[index + 1] if index + 1 < len(starts) else len(file.content))
        for index, start in enumerate(starts)
    ] or [("document", 0, len(file.content))]


def _signature_outline(file: SnapshotFile) -> Chunk:
    """Preserve a useful, bounded file signature instead of silently dropping large input."""
    lines = file.content.splitlines()
    signatures = [
        line.strip()
        for line in lines
        if line.lstrip().startswith(("def ", "class ", "function ", "export ", "interface ", "type "))
        or (file.language in {"yaml", "toml", "json"} and line.strip().endswith((":", "{", "[")))
    ][:200]
    outline = "\n".join(signatures) or "\n".join(lines[:80])
    content = (
        f"path: {file.path}\nlanguage: {file.language}\nsymbol: signature-outline\n"
        f"note: file exceeds retrieval budget; this is a signature outline\n\n{outline}\n"
    )
    return Chunk(
        id=f"{file.path}:outline",
        path=file.path,
        language=file.language,
        symbol="signature-outline",
        content=content,
        source_start=0,
        source_end=len(file.content),
    )


def _split_span(symbol: str, text: str, start: int, end: int) -> list[tuple[str, int, int]]:
    if _token_offset(text, start, MAX_CHUNK_TOKENS) >= end:
        return [(symbol, start, end)]
    spans: list[tuple[str, int, int]] = []
    cursor, part = start, 1
    while cursor < end:
        chunk_end = min(_token_offset(text, cursor, MAX_CHUNK_TOKENS), end)
        spans.append((f"{symbol}#{part}", cursor, chunk_end))
        if chunk_end == end:
            break
        cursor = min(_token_offset(text, cursor, MAX_CHUNK_TOKENS - OVERLAP_TOKENS), end)
        part += 1
    return spans


def chunk_file(file: SnapshotFile) -> list[Chunk]:
    if len(file.content.encode("utf-8")) > OUTLINE_THRESHOLD_BYTES:
        return [_signature_outline(file)]
    spans = _structured_spans(file) or _tree_sitter_spans(file) or [("file", 0, len(file.content))]
    chunks: list[Chunk] = []
    for symbol, start, end in spans:
        for split_symbol, split_start, split_end in _split_span(symbol, file.content, start, end):
            content = file.content[split_start:split_end]
            prefix = f"path: {file.path}\nlanguage: {file.language}\nsymbol: {split_symbol}\n\n"
            chunks.append(Chunk(
                id=f"{file.path}:{split_start}-{split_end}", path=file.path, language=file.language,
                symbol=split_symbol, content=prefix + content, source_start=split_start, source_end=split_end,
            ))
    return chunks


def chunk_snapshot(files: list[SnapshotFile]) -> list[Chunk]:
    return [chunk for file in files for chunk in chunk_file(file)]
