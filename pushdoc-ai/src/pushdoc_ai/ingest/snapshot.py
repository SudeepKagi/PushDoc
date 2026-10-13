from __future__ import annotations

import io
import tarfile
from dataclasses import dataclass, field
from pathlib import PurePosixPath

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError
from pushdoc_ai.ingest.filters import GitIgnore, should_include
from pushdoc_ai.ingest.language import detect_language

MAX_ARCHIVE_BYTES = 25 * 1024 * 1024
MAX_EXTRACTED_BYTES = 100 * 1024 * 1024


@dataclass(frozen=True)
class SnapshotFile:
    path: PurePosixPath
    content: str
    language: str
    truncated: bool = False


@dataclass
class Snapshot:
    files: list[SnapshotFile] = field(default_factory=list)
    skipped_paths: list[str] = field(default_factory=list)
    unknown_paths: list[str] = field(default_factory=list)


def _safe_path(name: str) -> PurePosixPath:
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise PushDocAIError(f"Unsafe archive path: {name}", ErrorClass.FATAL_JOB)
    return path


def parse_snapshot(archive: bytes) -> Snapshot:
    if len(archive) > MAX_ARCHIVE_BYTES:
        raise PushDocAIError("Snapshot exceeds the compressed payload limit", ErrorClass.FATAL_JOB)
    snapshot, extracted_bytes = Snapshot(), 0
    extracted: list[tuple[PurePosixPath, bytes]] = []
    try:
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
            for member in tar:
                path = _safe_path(member.name)
                if member.issym() or member.islnk() or member.isdev():
                    raise PushDocAIError(f"Snapshot contains a link or device: {path}", ErrorClass.FATAL_JOB)
                if not member.isfile():
                    continue
                extracted_bytes += member.size
                if extracted_bytes > MAX_EXTRACTED_BYTES:
                    raise PushDocAIError("Snapshot exceeds the extracted size limit", ErrorClass.FATAL_JOB)
                handle = tar.extractfile(member)
                if handle is None:
                    raise PushDocAIError(f"Cannot extract {path}", ErrorClass.FATAL_JOB)
                content = handle.read()
                extracted.append((path, content))
    except tarfile.TarError as error:
        raise PushDocAIError("Snapshot is not a valid gzip tar archive", ErrorClass.FATAL_JOB) from error
    gitignore = GitIgnore(next((content.decode("utf-8", errors="replace") for path, content in extracted if str(path) == ".gitignore"), ""))
    for path, content in extracted:
        if not should_include(path, content, gitignore):
            snapshot.skipped_paths.append(str(path))
            continue
        text = content.decode("utf-8", errors="replace")
        language = detect_language(path, text)
        if language == "unknown":
            snapshot.unknown_paths.append(str(path))
        snapshot.files.append(SnapshotFile(path, text, language))
    return snapshot
