from __future__ import annotations

import os

import httpx

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError, classify_http_error
from pushdoc_ai.models.fallbacks import retry_transient
from pushdoc_ai.models.registry import ModelRegistry


class RerankerClient:
    def __init__(self, registry: ModelRegistry):
        self.registry = registry

    async def rerank(self, query: str, documents: list[str], top_n: int) -> list[tuple[int, float]]:
        _, spec = self.registry.candidates("reranker")[0]
        base_url, api_key = os.getenv(spec.base_url_env), os.getenv(spec.api_key_env)
        if not base_url:
            raise PushDocAIError(f"Missing {spec.base_url_env}", ErrorClass.FATAL_CONFIG)
        headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}

        async def request() -> list[tuple[int, float]]:
            try:
                async with httpx.AsyncClient(timeout=spec.timeout_s) as client:
                    response = await client.post(
                        f"{base_url.rstrip('/')}/rerank",
                        json={"query": query, "texts": documents, "top_n": top_n},
                        headers=headers,
                    )
                if response.status_code >= 400:
                    raise PushDocAIError("Reranker request failed", classify_http_error(response.status_code), status_code=response.status_code)
                return [(item["index"], float(item["score"])) for item in response.json()]
            except httpx.TimeoutException as error:
                raise PushDocAIError("Reranker request timed out", ErrorClass.DEGRADE) from error
            except httpx.NetworkError as error:
                raise PushDocAIError("Reranker network request failed", ErrorClass.DEGRADE) from error

        return await retry_transient(request)
