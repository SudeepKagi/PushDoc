from pushdoc_ai.core.errors import ErrorClass, classify_http_error


def test_error_taxonomy_routes_model_removal_and_truncation_to_fallback():
    assert classify_http_error(404) is ErrorClass.FALLBACK
    assert classify_http_error(410) is ErrorClass.FALLBACK
    assert classify_http_error(None, "length") is ErrorClass.FALLBACK
    assert classify_http_error(None, "safety") is ErrorClass.FALLBACK


def test_error_taxonomy_retries_transient_errors():
    assert classify_http_error(429) is ErrorClass.FALLBACK
    assert classify_http_error(503) is ErrorClass.RETRY_SAME
    assert classify_http_error(None, "timeout") is ErrorClass.RETRY_SAME
