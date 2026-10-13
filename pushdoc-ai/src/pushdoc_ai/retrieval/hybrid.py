from __future__ import annotations

import math
import re
from collections import Counter, defaultdict

from pushdoc_ai.retrieval.index import IndexedChunk


def _terms(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z0-9_]+", text.lower())


def bm25(records: list[IndexedChunk], query: str, limit: int = 30, k1: float = 1.5, b: float = 0.75) -> list[IndexedChunk]:
    terms, document_terms = _terms(query), [_terms(record.chunk.content) for record in records]
    if not terms:
        return []
    average_length = sum(map(len, document_terms)) / max(len(document_terms), 1)
    doc_frequency = Counter(term for tokens in document_terms for term in set(tokens))
    scores: list[tuple[float, IndexedChunk]] = []
    for record, tokens in zip(records, document_terms, strict=True):
        counts, score = Counter(tokens), 0.0
        for term in terms:
            frequency = counts[term]
            if not frequency:
                continue
            inverse_frequency = math.log(1 + (len(records) - doc_frequency[term] + 0.5) / (doc_frequency[term] + 0.5))
            score += inverse_frequency * frequency * (k1 + 1) / (frequency + k1 * (1 - b + b * len(tokens) / average_length))
        if score:
            scores.append((score, record))
    return [record for _, record in sorted(scores, key=lambda item: item[0], reverse=True)[:limit]]


def reciprocal_rank_fusion(*ranked_lists: list[IndexedChunk], k: int = 60) -> list[IndexedChunk]:
    scores: defaultdict[str, float] = defaultdict(float)
    lookup: dict[str, IndexedChunk] = {}
    for ranked in ranked_lists:
        for rank, record in enumerate(ranked, start=1):
            scores[record.chunk.id] += 1 / (k + rank)
            lookup[record.chunk.id] = record
    return [lookup[key] for key in sorted(scores, key=scores.__getitem__, reverse=True)]


def mmr(records: list[IndexedChunk], query: list[float] | None, limit: int, diversity: float = 0.25) -> list[IndexedChunk]:
    if query is None:
        return records[:limit]
    selected: list[IndexedChunk] = []
    remaining = records.copy()
    while remaining and len(selected) < limit:
        def score(record: IndexedChunk) -> float:
            relevance = sum(left * right for left, right in zip(query, record.vector or [], strict=False))
            redundancy = max((sum(a * b for a, b in zip(record.vector or [], chosen.vector or [], strict=False)) for chosen in selected), default=0.0)
            return relevance - diversity * redundancy
        selected.append(max(remaining, key=score))
        remaining.remove(selected[-1])
    return selected
