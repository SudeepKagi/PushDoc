from __future__ import annotations

from pathlib import PurePosixPath

from pushdoc_ai.graph.state import SectionPlan
from pushdoc_ai.ingest.chunking import Chunk
from pushdoc_ai.retrieval.hybrid import bm25
from pushdoc_ai.retrieval.index import IndexedChunk
from pushdoc_ai.retrieval.query_expansion import cached_deterministic_queries


def retrieve_section_evidence(plan: SectionPlan, facts: dict, limit: int = 12) -> tuple[list[dict], bool]:
    """Retrieve a bounded, serialisable evidence pack when remote embeddings are unavailable."""
    records = [
        IndexedChunk(
            Chunk(
                id=item["id"],
                path=PurePosixPath(item["path"]),
                language=item["language"],
                symbol=item["symbol"],
                content=item["content"],
                source_start=item["source_start"],
                source_end=item["source_end"],
            ),
            None,
        )
        for item in facts.get("retrieval_chunks", [])
    ]
    queries, cache_hit = cached_deterministic_queries(plan.id, facts)
    ranked: list[IndexedChunk] = []
    for query in queries:
        for record in bm25(records, query):
            if record not in ranked:
                ranked.append(record)
    per_file: dict[str, int] = {}
    packed: list[dict] = []
    for record in ranked:
        path = str(record.chunk.path)
        if per_file.get(path, 0) >= 3:
            continue
        packed.append(
            {
                "id": record.chunk.id,
                "path": path,
                "symbol": record.chunk.symbol,
                "content": record.chunk.content,
            }
        )
        per_file[path] = per_file.get(path, 0) + 1
        if len(packed) == limit:
            break
    return packed, cache_hit
