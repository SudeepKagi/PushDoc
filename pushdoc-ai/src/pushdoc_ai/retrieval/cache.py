from __future__ import annotations

import struct


class VectorCache:
    """Float16-compatible byte cache boundary; replace backing dict with Redis in deployment."""

    def __init__(self):
        self._values: dict[str, bytes] = {}

    def get(self, key: str) -> list[float] | None:
        raw = self._values.get(key)
        return list(struct.unpack(f"<{len(raw) // 2}e", raw)) if raw else None

    def set(self, key: str, vector: list[float]) -> None:
        self._values[key] = struct.pack(f"<{len(vector)}e", *vector)

    @property
    def hit_count(self) -> int:
        return len(self._values)
