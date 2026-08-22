# 🤖 PushDoc

> PushDoc is a GitHub App that automates the generation and committing of professional `README.md` files to your repositories. It uses a multi-stage intelligence pipeline — static AST analysis, deterministic code analyzers, and an in-memory RAG engine backed by Gemini embeddings — to build rich repository context, then feeds it to AI models (Gemini, Groq) for high-quality README content that is validated before being committed.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📋 Table of Contents

* [✨ Features](#-features)
* [🏗️ Architecture](#️-architecture)
* [🛠️ Tech Stack](#️-tech-stack)
* [📁 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#️-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🚀 Usage / Run Instructions](#-usage--run-instructions)
* [🌐 API Reference](#-api-reference)
* [🗄️ Database Models](#️-database-models)

---

## ✨ Features

* **GitHub App Integration**: Authenticates and integrates with GitHub accounts and repositories via the PushDoc GitHub App using `@octokit/app` and `@octokit/rest`.
* **Multi-Stage Repository Intelligence Pipeline**: Reads, analyzes, and understands repository code through a layered pipeline:
    * **Repository Reader** — Scans and reads all source files while respecting ignore rules.
    * **AST Analyzer** — Uses `@babel/parser` and `@babel/traverse` to deterministically extract Express routes, `process.env` references, frontend API call sites, and `.env.example` keys from JS/TS/JSX source files.
    * **Package Analyzer** — Extracts project metadata, dependencies, and technology classifications from `package.json`.
    * **Route Analyzer** — Discovers HTTP endpoints, middlewares, and controller bindings from Express router files.
    * **Model Analyzer** — Extracts Mongoose schema definitions including fields, types, constraints, indexes, hooks, and plugins.
    * **Controller Analyzer** — Maps controller functions to their business operations, database model usage, and external integrations.
    * **Feature Analyzer** — Infers high-level application features and capabilities from the combined knowledge of routes, models, controllers, and AST facts.
* **In-Memory RAG Engine**: For larger repositories (>40 files), builds a vector index using Gemini `text-embedding-004` embeddings with overlapping code chunks, then performs semantic similarity retrieval to select the most relevant source code for AI context — avoiding token overflow while preserving signal quality.
* **AI-Powered README Generation**: Supports multiple AI providers with automatic failover. Gemini (`gemini-2.5-flash`) is the primary provider; Groq (`llama-3.3-70b-versatile`) serves as a fallback. Multiple API keys per provider enable round-robin rotation on rate limits.
* **Post-Generation Validation & Sanitization**: Validates generated README content against repository facts — audits shields.io badges against confirmed `package.json` dependencies and strips unverified badges. A separate README validator scores output for required sections, word count, heading hierarchy, duplicate headings, table formatting, placeholder text, feature/model/route coverage, and project name consistency.
* **Automated Webhook-Driven Updates**: Processes `push` events on the default branch to automatically queue README regeneration. Detects and skips self-generated commits to prevent infinite loops. Also handles `installation_repositories` events (added/removed repos).
* **BullMQ Job Queue with Redis**: README generation jobs are managed through a BullMQ queue with configurable retry attempts (3) and exponential backoff (5s base). Jobs progress through lifecycle stages: `QUEUED → CLONING → READING → GENERATING → WRITING → COMMITTING → PUSHING → COMPLETED`.
* **Manual Generation & Repository Toggle**: Users can manually trigger README generation for specific repositories and toggle PushDoc on/off per repository. First-time activation auto-queues an initial generation job.
* **Repository Synchronization**: Syncs GitHub repositories from the App installation to the local database, allowing per-repository management.
* **Job Tracking & Log Files**: Tracks full job lifecycle with per-job log files (`temp/logs/<bullJobId>.log`). Logs are structured with timestamps, levels, and job IDs, and are served through a dedicated API endpoint.
* **Workspace Management**: Creates isolated temporary workspaces per job for shallow Git clones. Includes automatic cleanup after job completion and stale workspace purging at server startup (30-minute threshold).
* **Graceful Shutdown**: Handles `SIGTERM`/`SIGINT` signals with a 10-second forced shutdown timeout.
* **Rate Limiting**: Applies `express-rate-limit` — 10 requests/15 min for auth endpoints, 100 requests/15 min for general API endpoints.
* **React Dashboard**: A React + Vite frontend with pages for landing, onboarding, connecting GitHub, a repository dashboard, repository detail view, build logs viewer, settings, and AI provider configuration.

---

## 🏗️ Architecture

```
┌────────────────┐     Webhook (push)      ┌──────────────────┐
│  GitHub Repos  │ ──────────────────────► │  Express Server  │
└────────────────┘                         └────────┬─────────┘
                                                    │
                                             Adds to BullMQ
                                                    │
                                                    ▼
                                           ┌────────────────┐
                                           │  Redis Queue   │
                                           └────────┬───────┘
                                                    │
                                                    ▼
                                           ┌────────────────────────────────────┐
                                           │        README Worker               │
                                           │                                    │
                                           │  1. Clone repo (shallow, 1 commit) │
                                           │  2. Read files (ignore rules)      │
                                           │  3. Analyze:                       │
                                           │     - AST facts (Babel)            │
                                           │     - Routes / Models / Ctrl       │
                                           │     - Package / Features           │
                                           │  4. Build context:                 │
                                           │     ≤40 files → raw source         │
                                           │     >40 files → RAG (embeddings)   │
                                           │  5. AI generation (Gemini → Groq)  │
                                           │  6. Validate & sanitize            │
                                           │  7. Write → Commit → Push          │
                                           └────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Server

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| Language | JavaScript (ES Modules) | Primary programming language |
| Runtime | Node.js | Server-side execution environment |
| Web Framework | Express v5 | HTTP API framework |
| Database | MongoDB (via Mongoose v9) | Persistent storage for users, installations, repos, jobs |
| Queue | BullMQ | Reliable job queue for README generation tasks |
| Queue Backend | Redis (via IORedis) | In-memory store backing BullMQ; supports Upstash/cloud Redis with TLS |
| Authentication | JWT (`jsonwebtoken`) | Bearer token-based API authentication |
| Authentication | GitHub OAuth | User login via GitHub OAuth App |
| GitHub Integration | `@octokit/app`, `@octokit/rest` | GitHub App authentication, installation management, API access |
| AI – Primary | Gemini API (`@google/genai`) | README content generation (model: `gemini-2.5-flash`) |
| AI – Fallback | Groq API (`groq-sdk`) | Fallback README generation (model: `llama-3.3-70b-versatile`) |
| AI – Embeddings | Gemini `text-embedding-004` | In-memory RAG vector index for large repositories |
| AST Parsing | `@babel/parser`, `@babel/traverse` | Deterministic extraction of routes, env vars, API calls from JS/TS/JSX |
| Git Operations | `simple-git` | Shallow cloning, committing, and pushing README changes |
| Rate Limiting | `express-rate-limit` | Per-IP rate limiting for auth and API endpoints |
| Logging | Morgan | HTTP request logging (dev mode only) |
| Logging | Custom logger service | Structured job-level logging with file output |

### Client

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| UI Framework | React v18 | Frontend component framework |
| Build Tool | Vite v6 | Development server and production bundler |
| Styling | Tailwind CSS v3 | Utility-first CSS framework |
| UI Components | Radix UI | Accessible primitives (Dialog, Dropdown, Tabs, Avatar, Select, etc.) |
| Icons | Lucide React | Icon library |
| Notifications | Sonner | Toast notification system |
| Utilities | `clsx`, `class-variance-authority`, `tailwind-merge` | Conditional class composition |

---

## 📁 Project Structure

```
PushDoc/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # UI components (dashboard, landing, layout, ui)
│   │   ├── constants/               # Config (BACKEND_URL)
│   │   ├── hooks/                   # Custom hooks (useGitHub, useLiveLogs)
│   │   ├── pages/                   # Page components (Landing, Dashboard, Detail, BuildLogs, etc.)
│   │   ├── styles/                  # CSS stylesheets
│   │   ├── utils/                   # API client utilities
│   │   └── App.jsx                  # Root application component
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                          # Express API server
│   ├── server.js                    # Entry point (DB connect, worker init, graceful shutdown)
│   ├── src/
│   │   ├── analyzers/               # Repository intelligence (AST, package, route, model, controller, feature)
│   │   ├── builders/                # Prompt & repository context construction (incl. RAG branch)
│   │   ├── config/                  # App config, DB connection, GitHub App init, AI provider config
│   │   ├── constants/               # Application and GitHub constants
│   │   ├── controllers/             # Request handlers (auth, github, webhook)
│   │   ├── managers/                # AI provider orchestration with multi-key failover
│   │   ├── middleware/              # JWT auth middleware
│   │   ├── models/                  # Mongoose schemas (User, Installation, InstallationState, Repository, Job)
│   │   ├── pipelines/               # End-to-end README generation pipeline
│   │   ├── providers/               # AI provider implementations (Gemini, Groq)
│   │   ├── queue/                   # BullMQ queue and Redis connection management
│   │   ├── readers/                 # File system readers with ignore rules
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/                # Business logic (auth, git, github, job, workspace, AI, embedding, retrieval, validation, logging)
│   │   ├── tests/                   # Unit tests (analyzer tests, validator tests, security tests)
│   │   ├── utils/                   # Custom error classes, AI utilities
│   │   ├── validators/              # README quality validation (sections, coverage, formatting)
│   │   └── workers/                 # BullMQ worker (readme.worker.js)
│   ├── keys/                        # GitHub App private key (.pem)
│   ├── .env.example                 # Environment variable template
│   ├── nodemon.json                 # Dev watcher config
│   └── package.json
├── package.json                     # Root package (orchestration scripts)
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

* **Node.js** (v18+ recommended)
* **npm**
* **MongoDB** instance (local or Atlas)
* **Redis** instance (local, Upstash, or any cloud Redis)
* A registered **GitHub App** with:
    * A private key (`.pem` file placed in `server/keys/` or provided via `GITHUB_PRIVATE_KEY` env var)
    * Webhook secret configured
    * OAuth App credentials (Client ID & Secret)
* At least one AI API key (Gemini or Groq)

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/SudeepKagi/PushDoc.git
    cd PushDoc
    ```

2.  **Server Setup:**
    ```bash
    cd server
    npm install
    cp .env.example .env
    ```
    Edit the `.env` file with your actual values (see [🔐 Environment Variables](#-environment-variables)).

    Place your GitHub App private key at `server/keys/pushdoc.<date>.private-key.pem` or set the `GITHUB_PRIVATE_KEY` environment variable.

3.  **Client Setup:**
    ```bash
    cd ../client
    npm install
    ```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory based on `server/.env.example`.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | Node.js environment (`development` or `production`) |
| `PORT` | Yes | Port for the Express server (default: `3000`) |
| `CORS_ORIGIN` | Yes | Allowed frontend origin for CORS |
| `FRONTEND_URL` | No | Frontend URL for OAuth redirect (default: `http://localhost:1234`) |
| `MONGODB_URI` | Yes | MongoDB connection URI |
| `REDIS_URL` | No | Full Redis connection URL (used for cloud Redis with TLS, e.g. Upstash). Takes precedence over `REDIS_HOST`/`REDIS_PORT`. |
| `REDIS_HOST` | No | Redis hostname (default: `127.0.0.1`). Used when `REDIS_URL` is not set. |
| `REDIS_PORT` | No | Redis port (default: `6379`). Used when `REDIS_URL` is not set. |
| `REDIS_PASSWORD` | No | Redis password (if required by your Redis instance) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret |
| `GITHUB_REDIRECT_URI` | Yes | Redirect URI for GitHub OAuth callbacks |
| `GITHUB_APP_ID` | Yes | GitHub App ID |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret for validating GitHub webhook payloads (HMAC SHA-256) |
| `GITHUB_PRIVATE_KEY` | No | GitHub App private key (PEM string with `\n` line breaks). Alternative to placing a `.pem` file in `server/keys/`. |
| `JWT_SECRET` | No | Secret key for signing JWTs |
| `GEMINI_API_KEY_1` | * | API key for Gemini AI (primary provider) |
| `GEMINI_API_KEY_2` | No | Additional Gemini API key for redundancy/rate limits |
| `GEMINI_API_KEY_3` | No | Additional Gemini API key for redundancy/rate limits |
| `GROQ_API_KEY_1` | * | API key for Groq AI (fallback provider) |
| `GROQ_API_KEY_2` | No | Additional Groq API key for redundancy/rate limits |
| `WORKSPACE_ROOT_PATH` | No | Absolute path for temporary repo clones (default: `./temp/workspaces` in dev, OS temp dir in production) |

> \* At least one Gemini or Groq API key is required. The server validates this at startup.

---

## 🚀 Usage / Run Instructions

**Start the backend server (development with auto-reload):**
```bash
cd server
npm run dev
```

**Start the backend server (production):**
```bash
cd server
npm start
```

**Start the frontend client (development):**
```bash
cd client
npm run dev
```

**Build the frontend for production:**
```bash
cd client
npm run build
```

**Using root-level scripts:**
```bash
# Build the client
npm run build

# Start the server
npm start
```

---

## 🌐 API Reference

All authenticated endpoints require a `Bearer <JWT>` token in the `Authorization` header.

### Auth Routes (`/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/auth/github/login` | No | Redirects to GitHub OAuth authorization URL. |
| `GET` | `/auth/github/callback` | No | Handles GitHub OAuth callback; creates/logs in user and redirects to frontend with token. |

### GitHub Routes (`/github`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/github/app` | Yes | Retrieves GitHub App information. |
| `GET` | `/github/install` | Yes | Redirects to GitHub for App installation with CSRF state. |
| `GET` | `/github/install/callback` | No | Handles GitHub App installation callback; saves installation details. |
| `GET` | `/github/repositories/sync` | Yes | Syncs user's GitHub repositories to the PushDoc database. |
| `GET` | `/github/jobs` | Yes | Retrieves the user's README generation jobs (max 50, newest first). |
| `GET` | `/github/jobs/:jobId/logs` | Yes | Fetches parsed log entries for a specific job. |
| `POST` | `/github/repositories/:repoId/trigger` | Yes | Manually triggers a README generation job for a repository. |
| `PATCH` | `/github/repositories/:repoId/toggle` | Yes | Toggles PushDoc active status for a repository. Auto-queues first job on activation. |

### Webhook Routes (`/webhooks`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/webhooks/github` | Signature | Receives GitHub webhook events. Validates `x-hub-signature-256` via HMAC SHA-256. |

### Health Check

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | No | Returns API status and Redis health (`ok` or `degraded`). |

---

## 🗄️ Database Models

PushDoc uses MongoDB via Mongoose with the following models:

| Model | Key Fields | Description |
| :--- | :--- | :--- |
| `User` | `githubId` (unique), `username`, `displayName`, `email`, `avatarUrl`, `githubAccessToken`, `provider` | Stores user profiles and GitHub authentication tokens. |
| `Installation` | `installationId` (unique), `user` (ref → User), `accountLogin`, `accountType` | Stores GitHub App installation details linked to a user. |
| `InstallationState` | `state` (unique), `user` (ref → User), `expiresAt` (TTL) | Temporary CSRF state for GitHub App installation flow. Auto-expires via MongoDB TTL index. |
| `Repository` | `githubId` (unique), `installation` (ref → Installation, indexed), `name`, `fullName`, `owner`, `private`, `cloneUrl`, `isActive` | Manages integrated GitHub repositories and their active status. |
| `Job` | `repository` (ref → Repository), `bullJobId` (unique), `commitSha`, `branch`, `status` (enum), `startedAt`, `completedAt`, `duration`, `error`, `originalReadme`, `generatedReadme`, `validationScore`, `validationWarnings` | Tracks the full lifecycle and output of each README generation job. Status values: `QUEUED`, `CLONING`, `READING`, `GENERATING`, `WRITING`, `COMMITTING`, `PUSHING`, `COMPLETED`, `FAILED`. |

---