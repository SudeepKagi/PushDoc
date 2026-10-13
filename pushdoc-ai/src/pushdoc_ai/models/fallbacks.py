from __future__ import annotations

import asyncio
import random
from collections.abc import Awaitable, Callable
from typing import TypeVar

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError

T = TypeVar("T")


async def retry_transient(call: Callable[[], Awaitable[T]], attempts: int = 3) -> T:
    for attempt in range(attempts):
        try:
            return await call()
        except PushDocAIError as error:
            if error.classification is not ErrorClass.RETRY_SAME or attempt == attempts - 1:
                raise
            await asyncio.sleep(min(2**attempt, 4) + random.uniform(0, 0.25))
    raise RuntimeError("unreachable")


async def first_success(candidates: list[Callable[[], Awaitable[T]]]) -> T:
    last_error: Exception | None = None
    for candidate in candidates:
        try:
            return await retry_transient(candidate)
        except PushDocAIError as error:
            last_error = error
            if error.classification is not ErrorClass.FALLBACK:
                raise
    raise PushDocAIError("All configured model fallbacks failed", ErrorClass.FATAL_JOB) from last_error
