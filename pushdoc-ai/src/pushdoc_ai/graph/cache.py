from __future__ import annotations

import hashlib
import json

_draft_cache: dict[str, str] = {}


def draft_cache_key(section_spec: dict, evidence_ids: set[str], prompt_version: str, model_id: str) -> str:
    payload = {"section": section_spec, "evidence": sorted(evidence_ids), "prompt": prompt_version, "model": model_id}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()


def get_draft(key: str) -> str | None:
    return _draft_cache.get(key)


def put_draft(key: str, markdown: str) -> None:
    _draft_cache[key] = markdown
