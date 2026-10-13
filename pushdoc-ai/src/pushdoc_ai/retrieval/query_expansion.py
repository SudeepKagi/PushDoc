from __future__ import annotations

import hashlib
import json

_query_cache: dict[str, list[str]] = {}


def deterministic_queries(section: str, facts: dict) -> list[str]:
    values = [section]
    for key in ("routes", "models", "env_vars", "scripts", "dependencies"):
        values.extend(map(str, facts.get(key, [])))
    return [" ".join(values)]


def expansion_cache_key(section: str, facts: dict) -> str:
    canonical_facts = json.dumps(facts, sort_keys=True, default=str, separators=(",", ":"))
    return hashlib.sha256(f"{section}:{canonical_facts}".encode()).hexdigest()


def cached_deterministic_queries(section: str, facts: dict) -> tuple[list[str], bool]:
    key = expansion_cache_key(section, facts)
    if key in _query_cache:
        return _query_cache[key], True
    queries = deterministic_queries(section, facts)
    _query_cache[key] = queries
    return queries, False
