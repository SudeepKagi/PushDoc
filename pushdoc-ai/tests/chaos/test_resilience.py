import pytest

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError
from pushdoc_ai.models.fallbacks import first_success


@pytest.mark.asyncio
async def test_fallback_chain_recovers_from_removed_model():
    calls = []

    async def removed():
        calls.append("removed")
        raise PushDocAIError("gone", ErrorClass.FALLBACK, status_code=404)

    async def healthy():
        calls.append("healthy")
        return "ok"

    assert await first_success([removed, healthy]) == "ok"
    assert calls == ["removed", "healthy"]


@pytest.mark.asyncio
async def test_non_fallback_error_is_not_hidden():
    async def invalid_snapshot():
        raise PushDocAIError("bad snapshot", ErrorClass.FATAL_JOB)

    with pytest.raises(PushDocAIError, match="bad snapshot"):
        await first_success([invalid_snapshot])
