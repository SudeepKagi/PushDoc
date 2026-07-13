/**
 * Structured Custom Error Classes for PushDoc
 *
 * WHY THIS EXISTS
 * ───────────────
 * In production, catching generic `Error` instances makes it extremely difficult
 * to distinguish between different failure modes. For example, a git clone timeout
 * should be handled differently (e.g. retryable) than a validation failure (which
 * is non-retryable and indicates bad data).
 *
 * By using specific Error subclasses, our queue worker and webhook handlers can
 * inspect the error type and make smart decisions about retries, alerts, and statuses.
 */

export class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ConfigError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export class GitError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}

export class AIProviderError extends AppError {
    constructor(message) {
        super(message, 502);
    }
}

export class GitHubError extends AppError {
    constructor(message, status = 502) {
        super(message, status);
    }
}

export class DatabaseError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}

export class WorkspaceError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}
