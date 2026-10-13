from __future__ import annotations

import asyncio
import math
import os

import httpx

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError, classify_http_error
from pushdoc_ai.models.fallbacks import retry_transient
from pushdoc_ai.models.registry import ModelRegistry


class EmbeddingClient:
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self._semaphore = asyncio.Semaphore(4)

    @staticmethod
    def _normalise(vector: list[float]) -> list[float]:
        magnitude = math.sqrt(sum(value * value for value in vector))
        if not magnitude:
            raise PushDocAIError("Embedding provider returned a zero vector", ErrorClass.FALLBACK)
        return [value / magnitude for value in vector]

    async def _embed(self, texts: list[str], query: bool) -> list[list[float]]:
        name, spec = self.registry.candidates("embedder")[0]
        base_url, api_key = os.getenv(spec.base_url_env), os.getenv(spec.api_key_env)
        if not base_url:
            raise PushDocAIError(f"Missing {spec.base_url_env}", ErrorClass.FATAL_CONFIG)
        prefixed = [(spec.query_prefix if query else spec.document_prefix) + text for text in texts]
        headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}

        async def request() -> list[list[float]]:
            try:
                async with self._semaphore, httpx.AsyncClient(timeout=spec.timeout_s) as client:
                    response = await client.post(f"{base_url.rstrip('/')}/embed", json={"inputs": prefixed}, headers=headers)
                if response.status_code >= 400:
                    raise PushDocAIError("Embedding request failed", classify_http_error(response.status_code), status_code=response.status_code)
                payload = response.json()
                vectors = payload if isinstance(payload, list) else payload.get("embeddings", [])
                if len(vectors) != len(texts):
                    raise PushDocAIError("Embedding response has an unexpected shape", ErrorClass.FALLBACK)
                return [self._normalise([float(value) for value in vector]) for vector in vectors]
            except httpx.TimeoutException as error:
                raise PushDocAIError("Embedding request timed out", ErrorClass.RETRY_SAME) from error
            except httpx.NetworkError as error:
                raise PushDocAIError("Embedding network request failed", ErrorClass.RETRY_SAME) from error

        return await retry_transient(request)

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float]] = []
        for offset in range(0, len(texts), 32):
            results.extend(await self._embed(texts[offset:offset + 32], query=False))
        return results

    async def embed_query(self, text: str) -> list[float]:
        return (await self._embed([text], query=True))[0]
