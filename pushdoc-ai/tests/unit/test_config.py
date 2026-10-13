import asyncio
from pathlib import Path

import pytest

from pushdoc_ai.core.config import load_models_config
from pushdoc_ai.core.errors import ErrorClass, PushDocAIError
from pushdoc_ai.models.preflight import preflight_models
from pushdoc_ai.models.registry import ModelRegistry


def test_model_config_loads_all_required_roles():
    config = load_models_config(Path(__file__).parents[2] / "config" / "models.yaml")
    registry = ModelRegistry(config)
    assert {"planner", "drafter", "judge", "embedder", "reranker"} <= set(config.roles)
    assert registry.candidates("drafter")[0][1].model_id


def test_preflight_checks_each_chat_model_once():
    config_path = Path(__file__).parents[2] / "config" / "models.yaml"
    registry = ModelRegistry(load_models_config(config_path))

    class Pool:
        def __init__(self):
            self.checked: list[str] = []

        async def invoke_model(self, name: str, _: str) -> str:
            self.checked.append(name)
            return "ok"

    pool = Pool()
    asyncio.run(preflight_models(registry, pool))
    assert pool.checked == ["drafter-primary", "drafter-groq", "drafter-gemini"]


def test_preflight_converts_provider_error_to_fatal_config():
    registry = ModelRegistry(load_models_config(Path(__file__).parents[2] / "config" / "models.yaml"))

    class Pool:
        async def invoke_model(self, _: str, __: str) -> str:
            raise PushDocAIError("gone", ErrorClass.FALLBACK, status_code=404)

    with pytest.raises(PushDocAIError) as error:
        asyncio.run(preflight_models(registry, Pool()))
    assert error.value.classification is ErrorClass.FATAL_CONFIG
