from pathlib import PurePosixPath
import asyncio

from pushdoc_ai.ingest.chunking import Chunk
from pushdoc_ai.retrieval.cache import VectorCache
from pushdoc_ai.retrieval.hybrid import bm25, reciprocal_rank_fusion
from pushdoc_ai.retrieval.index import IndexedChunk, LanceJobIndex, index_key


def record(identifier: str, text: str) -> IndexedChunk:
    return IndexedChunk(Chunk(identifier, PurePosixPath(f"src/{identifier}.py"), "python", identifier, text, 0, len(text)), [1.0, 0.0])


def test_index_key_changes_for_blob_model_and_dimension():
    base = index_key("repo", "blob-a", "model-a", 1024)
    assert base != index_key("repo", "blob-b", "model-a", 1024)
    assert base != index_key("repo", "blob-a", "model-b", 1024)
    assert base != index_key("repo", "blob-a", "model-a", 768)


def test_bm25_and_rrf_promote_relevant_chunks():
    route = record("routes", "GET /orders returns customer orders")
    config = record("config", "database configuration")
    ranked = bm25([config, route], "orders route")
    assert ranked[0] == route
    assert reciprocal_rank_fusion([route], [route, config])[0] == route


def test_vector_cache_uses_compact_binary_vectors():
    cache = VectorCache()
    cache.set("one", [0.25, 0.5])
    assert cache.get("one") == [0.25, 0.5]


def test_lance_job_index_persists_a_per_job_table(tmp_path):
    index = asyncio.run(LanceJobIndex.create(tmp_path / "job-index", [record("routes", "GET /orders")]))
    assert len(index.records) == 1
    assert (tmp_path / "job-index").exists()
