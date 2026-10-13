from __future__ import annotations

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError
from pushdoc_ai.models.chat import ChatPool
from pushdoc_ai.models.registry import ModelRegistry


async def preflight_models(registry: ModelRegistry, chat_pool: ChatPool) -> None:
    """Fail readiness early for models that have been removed or disabled at the provider."""
    checked: set[str] = set()
    for role in ("planner", "drafter", "judge"):
        for model_name, _ in registry.candidates(role):
            if model_name in checked:
                continue
            checked.add(model_name)
            try:
                await chat_pool.invoke_model(model_name, "Reply with exactly: ok")
            except PushDocAIError as error:
                raise PushDocAIError(
                    f"Preflight failed for {role}/{model_name}: {error}", ErrorClass.FATAL_CONFIG,
                    status_code=error.status_code,
                ) from error
