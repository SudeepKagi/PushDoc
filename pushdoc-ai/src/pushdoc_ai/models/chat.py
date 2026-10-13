from __future__ import annotations

import os
from collections.abc import AsyncIterator

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError, classify_http_error
from pushdoc_ai.models.fallbacks import first_success
from pushdoc_ai.models.registry import ModelRegistry


def _status(error: Exception) -> int | None:
    return getattr(error, "status_code", None) or getattr(getattr(error, "response", None), "status_code", None)


class ChatPool:
    """A provider-neutral, async, fallback-capable chat client."""

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self._clients: dict[str, ChatOpenAI] = {}

    def _client(self, model_name: str) -> ChatOpenAI:
        if model_name in self._clients:
            return self._clients[model_name]
        spec = self.registry.get(model_name)
        base_url, api_key = os.getenv(spec.base_url_env), os.getenv(spec.api_key_env)
        if not base_url or not api_key:
            raise PushDocAIError(
                f"Missing configuration for model {model_name}", ErrorClass.FATAL_CONFIG
            )
        client = ChatOpenAI(
            model=spec.model_id,
            base_url=base_url,
            api_key=api_key,
            timeout=spec.timeout_s,
            max_tokens=spec.max_tokens,
            temperature=spec.temperature,
        )
        self._clients[model_name] = client
        return client

    async def invoke(self, role: str, prompt: str) -> str:
        return await first_success([
            lambda model_name=name: self.invoke_model(model_name, prompt)
            for name, _ in self.registry.candidates(role)
        ])

    async def invoke_model(self, model_name: str, prompt: str) -> str:
        try:
            response = await self._client(model_name).ainvoke([HumanMessage(content=prompt)])
        except PushDocAIError:
            raise
        except Exception as error:
            raise PushDocAIError(
                str(error), classify_http_error(_status(error)), status_code=_status(error)
            ) from error
        text = response.content if isinstance(response.content, str) else "".join(map(str, response.content))
        if not text.strip():
            raise PushDocAIError("Model returned empty output", ErrorClass.FALLBACK)
        return text

    async def stream(self, role: str, prompt: str) -> AsyncIterator[str]:
        # A stream cannot safely switch providers after yielding data; fallback happens before first token.
        for model_name, _ in self.registry.candidates(role):
            try:
                yielded = False
                async for chunk in self._client(model_name).astream([HumanMessage(content=prompt)]):
                    text = chunk.content if isinstance(chunk.content, str) else "".join(map(str, chunk.content))
                    if text:
                        yielded = True
                        yield text
                if yielded:
                    return
                raise PushDocAIError("Model returned empty stream", ErrorClass.FALLBACK)
            except PushDocAIError as error:
                if error.classification is not ErrorClass.FALLBACK:
                    raise
        raise PushDocAIError("All configured model fallbacks failed", ErrorClass.FATAL_JOB)
