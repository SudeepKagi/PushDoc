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

export class PipelineError extends AppError {
    constructor(stage, message, originalError = null) {
        super(`[${stage}] ${message}`, 500);
        this.stage = stage;
        this.originalError = originalError;
        if (originalError?.stack) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
