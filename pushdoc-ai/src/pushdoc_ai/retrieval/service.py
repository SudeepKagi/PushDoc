from __future__ import annotations

from dataclasses import dataclass, field

from pushdoc_ai.core.errors import PushDocAIError
from pushdoc_ai.models.embeddings import EmbeddingClient
from pushdoc_ai.models.rerank import RerankerClient
from pushdoc_ai.retrieval.hybrid import bm25, mmr, reciprocal_rank_fusion
from pushdoc_ai.retrieval.index import InMemoryVectorIndex, IndexedChunk


@dataclass
class RetrievalResult:
    records: list[IndexedChunk]
    degraded_flags: set[str] = field(default_factory=set)


class HybridRetriever:
    def __init__(self, index: InMemoryVectorIndex, embeddings: EmbeddingClient, reranker: RerankerClient | None = None):
        self.index, self.embeddings, self.reranker = index, embeddings, reranker

    async def retrieve(self, query: str, limit: int = 12) -> RetrievalResult:
        keyword = bm25(self.index.records, query)
        query_vector: list[float] | None = None
        flags: set[str] = set()
        try:
            query_vector = await self.embeddings.embed_query(query)
            fused = reciprocal_rank_fusion(keyword, self.index.dense_search(query_vector))
        except PushDocAIError:
            fused, flags = keyword, {"no_dense"}
        candidates = mmr(fused, query_vector, limit=max(limit, 12))
        if self.reranker and candidates:
            try:
                ranked = await self.reranker.rerank(query, [item.chunk.content for item in candidates], limit)
                candidates = [candidates[index] for index, _ in ranked]
            except PushDocAIError:
                flags.add("no_rerank")
        packed, per_file = [], {}
        for candidate in candidates:
            path = str(candidate.chunk.path)
            if per_file.get(path, 0) < 3:
                packed.append(candidate)
                per_file[path] = per_file.get(path, 0) + 1
            if len(packed) == limit:
                break
        return RetrievalResult(packed, flags)
