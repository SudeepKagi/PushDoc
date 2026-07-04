export const divider = () => {
    console.log(
        "========================================"
    );
};

export const info = (
    jobId,
    message
) => {
    console.log(
        `[Job ${jobId}] ℹ️ ${message}`
    );
};

export const success = (
    jobId,
    message
) => {
    console.log(
        `[Job ${jobId}] ✅ ${message}`
    );
};

export const error = (
    jobId,
    message
) => {
    console.error(
        `[Job ${jobId}] ❌ ${message}`
    );
};