export const shouldRetry = (
    error
) => {

    const message =
        error?.message?.toLowerCase() || "";

    return (

        message.includes("429") ||

        message.includes("quota") ||

        message.includes("rate limit") ||

        message.includes("resource exhausted") ||

        message.includes("503") ||

        message.includes("timeout")

    );

};