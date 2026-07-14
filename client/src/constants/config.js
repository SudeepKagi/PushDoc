export const BACKEND_URL = "http://localhost:3000";

export const INITIAL_LOGS = [
    { time: "14:02:01", type: "INFO", text: "Initializing PushDoc Worker v2.4.0..." },
    { time: "14:02:01", type: "INFO", text: "Authenticating with GitHub API via App Token..." },
    { time: "14:02:02", type: "SUCCESS", text: "Connection established to pushdoc/core-engine" },
    { time: "14:02:02", type: "INFO", text: "Pulling commit #d2f8a1e..." },
    { time: "14:02:03", type: "INFO", text: "Analyzing changed files: auth_middleware.ts, types.d.ts" },
    { time: "14:02:04", type: "INFO", text: "Executing AI Documentation Engine (Gemini Pro)..." },
    { time: "14:02:05", type: "INFO", text: "Identifying function signatures and decorator patterns..." },
    { time: "14:02:06", type: "INFO", text: "Generating README blocks for validateSession()" },
    { time: "14:02:07", type: "INFO", text: "Generating README blocks for refreshToken()" },
    { time: "14:02:08", type: "INFO", text: "Cross-referencing internal documentation links..." },
    { time: "14:02:09", type: "INFO", text: "Validating Markdown syntax against standards..." },
    { time: "14:02:10", type: "SUCCESS", text: "Documentation artifacts generated successfully." },
    { time: "14:02:11", type: "INFO", text: "Preparing pull request to origin/documentation-sync" },
    { time: "14:02:12", type: "INFO", text: "Buffering changes... 94%" }
];

export const LOG_ADDITIONS = [
    "Checking workspace integrity...",
    "Found 3 unmapped TypeScript modules.",
    "Running docstring inference engine...",
    "Mapping successful. Memory usage: 124MB",
    "Pushing document artifacts to main repo...",
    "Webhook job has been successfully executed."
];
