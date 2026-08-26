const CLIENT_MESSAGES = {
    400: "Invalid request",
    401: "Authentication required",
    403: "You do not have permission to perform this action",
    404: "Resource not found",
    429: "Too many requests. Please try again later.",
    502: "An upstream service is temporarily unavailable",
    503: "Service temporarily unavailable",
    504: "The request timed out. Please try again.",
};

export const publicErrorMessage = (error, status) => {
    if (error?.name === "ValidationError" && status === 400) {
        return error.message;
    }

    return CLIENT_MESSAGES[status] || "Internal server error";
};
