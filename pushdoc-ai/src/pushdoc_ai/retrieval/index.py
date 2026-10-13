from __future__ import annotations

import hashlib
import asyncio
from pathlib import Path
from dataclasses import dataclass

from pushdoc_ai.ingest.chunking import Chunk

CHUNKER_VERSION = "tree-sitter-v1"


def index_key(repo_id: str, blob_sha: str, model_id: str, dimensions: int) -> str:
    material = ":".join((repo_id, blob_sha, CHUNKER_VERSION, model_id, str(dimensions)))
    return hashlib.sha256(material.encode()).hexdigest()


@dataclass(frozen=True)
class IndexedChunk:
    chunk: Chunk
    vector: list[float] | None


class InMemoryVectorIndex:
    """Per-job index interface; Phase 3's LanceDB adapter can persist these records."""

    def __init__(self, records: list[IndexedChunk]):
        self.records = records

    def dense_search(self, query: list[float], limit: int = 30) -> list[IndexedChunk]:
        def score(record: IndexedChunk) -> float:
            return sum(left * right for left, right in zip(query, record.vector or [], strict=False))

        return sorted((record for record in self.records if record.vector), key=score, reverse=True)[:limit]


class LanceJobIndex(InMemoryVectorIndex):
    """Per-job LanceDB mirror. CPU/blocking Lance calls run outside the event loop."""

    @classmethod
    async def create(cls, directory: Path, records: list[IndexedChunk]) -> "LanceJobIndex":
        def write() -> None:
            import lancedb

            database = lancedb.connect(str(directory))
            rows = [
                {
                    "id": record.chunk.id,
                    "path": str(record.chunk.path),
                    "content": record.chunk.content,
                    "vector": record.vector or [],
                }
                for record in records
                if record.vector
            ]
            if rows:
                database.create_table("chunks", data=rows, mode="overwrite")

        await asyncio.to_thread(write)
        return cls(records)
