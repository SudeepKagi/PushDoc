from __future__ import annotations

import hmac
import os

from fastapi import Header, HTTPException


async def require_service_token(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("PUSHDOC_AI_SERVICE_TOKEN")
    if not expected:
        raise HTTPException(status_code=503, detail="Service token is not configured")
    provided = authorization.removeprefix("Bearer ") if authorization else ""
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Invalid service token")
