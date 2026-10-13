from __future__ import annotations

from enum import StrEnum


class ErrorClass(StrEnum):
    RETRY_SAME = "retry_same"
    FALLBACK = "fallback"
    DEGRADE = "degrade"
    FATAL_JOB = "fatal_job"
    FATAL_CONFIG = "fatal_config"


class PushDocAIError(Exception):
    def __init__(self, message: str, classification: ErrorClass, *, status_code: int | None = None):
        super().__init__(message)
        self.classification = classification
        self.status_code = status_code


def classify_http_error(status_code: int | None, provider_code: str | None = None) -> ErrorClass:
    """Classify provider errors from transport status and stable SDK/provider codes."""
    if provider_code in {"max_tokens", "length", "safety", "empty_output"}:
        return ErrorClass.FALLBACK
    if status_code in {404, 410, 429}:
        return ErrorClass.FALLBACK
    if status_code is not None and 500 <= status_code <= 599:
        return ErrorClass.RETRY_SAME
    if provider_code in {"timeout", "network_reset"}:
        return ErrorClass.RETRY_SAME
    return ErrorClass.FATAL_JOB
