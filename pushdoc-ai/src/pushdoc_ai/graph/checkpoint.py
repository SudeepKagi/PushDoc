from __future__ import annotations

from pathlib import Path


def development_checkpointer(database_path: Path):
    """Create the documented async SQLite checkpointer lazily for development."""
    from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

    return AsyncSqliteSaver.from_conn_string(str(database_path))
