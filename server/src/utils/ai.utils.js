export const FAILURE_ACTION = Object.freeze({ RETRY_KEY: "RETRY_KEY", FALLBACK: "FALLBACK", FATAL: "FATAL" });

/** Classify provider failures by HTTP status or provider error code, never prose. */
export const getFailureAction = (error) => {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status;
    const code = error?.code ?? error?.reason;

    if (["MAX_TOKENS", "LENGTH", "SAFETY", "EMPTY_OUTPUT", "EOPENBREAKER"].includes(code)) return FAILURE_ACTION.FALLBACK;
    if (status === 404 || status === 410 || status === 429) return FAILURE_ACTION.FALLBACK;
    if (status >= 500 && status < 600) return FAILURE_ACTION.RETRY_KEY;
    if (["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(code)) return FAILURE_ACTION.RETRY_KEY;
    return FAILURE_ACTION.FATAL;
};

export const shouldRetry = (error) => getFailureAction(error) !== FAILURE_ACTION.FATAL;
