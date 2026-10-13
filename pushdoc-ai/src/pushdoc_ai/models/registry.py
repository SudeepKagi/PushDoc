from __future__ import annotations

from pushdoc_ai.core.config import ModelSpec, ModelsConfig


class ModelRegistry:
    def __init__(self, config: ModelsConfig):
        self._config = config

    def candidates(self, role: str) -> list[tuple[str, ModelSpec]]:
        try:
            role_spec = self._config.roles[role]
        except KeyError as exc:
            raise KeyError(f"Unknown model role: {role}") from exc
        names = [role_spec.primary, *role_spec.fallbacks]
        return [(name, self._config.models[name]) for name in names if self._config.models[name].enabled]

    def get(self, name: str) -> ModelSpec:
        return self._config.models[name]
