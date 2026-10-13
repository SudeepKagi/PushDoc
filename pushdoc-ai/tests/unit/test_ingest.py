import io
import tarfile
from pathlib import PurePosixPath

import pytest

from pushdoc_ai.core.errors import PushDocAIError
from pushdoc_ai.ingest.chunking import chunk_file
from pushdoc_ai.ingest.language import detect_language
from pushdoc_ai.ingest.snapshot import SnapshotFile, parse_snapshot


def archive_with(name: str, body: bytes, *, symlink: bool = False) -> bytes:
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz") as tar:
        info = tarfile.TarInfo(name)
        if symlink:
            info.type = tarfile.SYMTYPE
            info.linkname = "outside"
            tar.addfile(info)
        else:
            info.size = len(body)
            tar.addfile(info, io.BytesIO(body))
    return output.getvalue()


def test_snapshot_rejects_path_traversal_and_symlinks():
    with pytest.raises(PushDocAIError):
        parse_snapshot(archive_with("../outside.py", b"print('x')"))
    with pytest.raises(PushDocAIError):
        parse_snapshot(archive_with("link", b"", symlink=True))


def test_snapshot_filters_dependencies_and_records_unknown_files():
    payload = io.BytesIO()
    with tarfile.open(fileobj=payload, mode="w:gz") as tar:
        for name, body in [("src/main.py", b"print('ok')"), ("venv/x.py", b"bad"), ("notes.custom", b"note")]:
            info = tarfile.TarInfo(name)
            info.size = len(body)
            tar.addfile(info, io.BytesIO(body))
    snapshot = parse_snapshot(payload.getvalue())
    assert [str(file.path) for file in snapshot.files] == ["src/main.py", "notes.custom"]
    assert snapshot.skipped_paths == ["venv/x.py"]
    assert snapshot.unknown_paths == ["notes.custom"]


def test_snapshot_honours_root_gitignore_and_negation():
    payload = io.BytesIO()
    with tarfile.open(fileobj=payload, mode="w:gz") as tar:
        for name, body in [
            (".gitignore", b"generated/\n*.secret\n!keep.secret\n"),
            ("generated/client.py", b"ignored"),
            ("config/app.secret", b"ignored"),
            ("config/keep.secret", b"kept"),
        ]:
            info = tarfile.TarInfo(name)
            info.size = len(body)
            tar.addfile(info, io.BytesIO(body))
    snapshot = parse_snapshot(payload.getvalue())
    assert [str(file.path) for file in snapshot.files] == [".gitignore", "config/keep.secret"]
    assert snapshot.skipped_paths == ["generated/client.py", "config/app.secret"]


def test_language_detection_uses_extension_and_shebang():
    assert detect_language(PurePosixPath("service"), "#!/usr/bin/env python\n") == "python"
    assert detect_language(PurePosixPath("component.tsx"), "") == "tsx"


def test_chunks_preserve_symbol_source_intervals():
    content = "def one():\n    return 1\n\n\ndef two():\n    return 2\n"
    file = SnapshotFile(PurePosixPath("src/main.py"), content, "python")
    chunks = chunk_file(file)
    assert len(chunks) == 2
    assert [content[chunk.source_start:chunk.source_end] for chunk in chunks] == [
        "def one():\n    return 1", "def two():\n    return 2",
    ]
    assert all("path: src/main.py" in chunk.content for chunk in chunks)


def test_chunks_keep_unicode_source_boundaries_correct():
    content = "# café\ndef greet():\n    return 'héllo'\n"
    chunks = chunk_file(SnapshotFile(PurePosixPath("src/main.py"), content, "python"))
    assert content[chunks[0].source_start:chunks[0].source_end] == "def greet():\n    return 'héllo'"


def test_structured_config_is_split_on_top_level_entries():
    content = "server:\n  port: 3000\ndatabase:\n  host: localhost\n"
    chunks = chunk_file(SnapshotFile(PurePosixPath("config.yaml"), content, "yaml"))
    assert [content[chunk.source_start:chunk.source_end] for chunk in chunks] == [
        "server:\n  port: 3000\n", "database:\n  host: localhost\n"
    ]


def test_oversized_file_produces_signature_outline():
    content = "def important():\n    return True\n" + ("# filler\n" * 20_000)
    chunks = chunk_file(SnapshotFile(PurePosixPath("src/large.py"), content, "python"))
    assert len(chunks) == 1
    assert chunks[0].symbol == "signature-outline"
    assert "def important():" in chunks[0].content
