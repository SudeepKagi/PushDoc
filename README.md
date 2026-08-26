# 🚀 PushDoc

[![PushDoc Quality Score](https://img.shields.io/badge/PushDoc%20Quality-85%2F100-yellow)](https://github.com/SudeepKagi/PushDoc)

> **Elevate your codebase with intelligent, automated documentation.** — PushDoc is a robust, monorepo-structured GitHub App that orchestrates multi-model AI inference with background job processing to generate, validate, and manage living documentation for your repositories, delivering real-time updates through a responsive React frontend.

 ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Google_Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white) ![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=fastapi&logoColor=white) ![GitHub_App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white) 

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏛️ System Architecture](#️-system-architecture)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔐 Environment Variables](#-environment-variables)
- [🌐 API Reference](#-api-reference)
- [🗄️ Database Models](#-database-models)
- [📜 Available Scripts](#-available-scripts)

---

## ✨ Features

- **🛡️ Secure GitHub App Integration**
 PushDoc integrates as a native GitHub App, securely managing installations, user authentication via GitHub OAuth, and processing repository webhooks. This provides a trusted, event-driven foundation for automated documentation workflows through dedicated API routes like `/install` and `POST /github`.

- **🤖 Multi-Model AI Documentation Generation**
 Leveraging an orchestration of large language models from Google Gemini and Groq, PushDoc intelligently synthesizes comprehensive, context-aware documentation. Generated content is stored in the `Job` model, complete with `validationScore` and `validationWarnings` for quality assurance.

- **🚀 Asynchronous Job Processing with BullMQ**
 Documentation generation and repository analysis are offloaded to a robust background processing pipeline powered by BullMQ and Redis. This ensures high throughput, fault tolerance, and non-blocking operations for complex, long-running tasks, managed via endpoints like `GET /jobs` and `POST /jobs/:jobId/cancel`.

- **📊 Real-time Job & Repository Management**
 Users can monitor the status of documentation jobs, view live logs via `GET /jobs/:jobId/logs`, and trigger manual generation directly from the intuitive React frontend using `POST /repositories/:repoId/trigger`. A dedicated API endpoint, `GET /events/stream`, provides Server-Sent Events (SSE) for continuous UI updates.

- **🔄 Automated Repository Synchronization**
 PushDoc automatically synchronizes with your GitHub repositories, detecting new installations and changes, and allowing users to toggle active documentation generation status for individual repositories via `PATCH /repositories/:repoId/toggle`. This ensures the platform is always reflecting your current codebase.

- **🔒 JWT-Secured User Authentication**
 Authentication is handled via a secure, token-based system using JSON Web Tokens (JWT). This provides robust session management for users interacting with the PushDoc API and frontend, ensuring authenticated access to private repository data through routes like `GET /me` and `POST /logout`.

- **📡 Comprehensive API Health & Readiness**
 The backend API provides dedicated `GET /health` and `GET /ready` endpoints to monitor service availability and dependencies, including a real-time Redis connection status. This is crucial for robust deployment, operational observability, and ensuring system uptime.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose & Role in Codebase |
| :------------------------- | :--------------------- | :------------------------------------------------------------------------------------------- |
| **Frontend/UI** | React | Building the interactive and responsive user interfaces for the PushDoc client. |
| | Vite | A fast, opinionated frontend build tool for rapid development and optimized production builds.|
| | Radix UI | A collection of unstyled, accessible UI components for building robust design systems. |
| | Tailwind CSS | A utility-first CSS framework for rapidly styling the client-side application. |
| | Sonner | A toast component for displaying notifications and system feedback to the user. |
| | Lucide React | A library of beautiful and consistent open-source icons for the UI. |
| **Backend/API** | Node.js | The JavaScript runtime environment executing the server-side logic and API. |
| | Express | A fast, unopinionated, minimalist web framework for building the RESTful API endpoints. |
| **Persistence & Caching** | MongoDB | The primary NoSQL database for storing application data like users, repositories, and jobs. |
| | Redis | An in-memory data store used for caching, session management, and BullMQ job queue storage. |
| **Task Queue & Background Jobs** | BullMQ | A robust, Redis-backed job queue for managing asynchronous tasks like documentation generation. |
| **AI & Inference** | Google Gemini | Multi-model AI provider for advanced documentation synthesis and content generation. |
| | Groq | High-performance AI inference provider, contributing to multi-model content generation. |
| **Authentication & Security** | JWT | JSON Web Tokens for secure, stateless user authentication and session management. |
| | GitHub App | Facilitates secure integration with GitHub for repository access, webhooks, and OAuth. |
| **Tooling & DevOps** | npm | Package manager for both client and server dependencies. |

---

## 🏛️ System Architecture

PushDoc operates as a monorepo containing distinct `client` (React/Vite) and `server` (Node.js/Express) services. The backend interacts with GitHub as an authenticated App, processing webhooks and managing user-linked repositories. Asynchronous documentation generation tasks are offloaded to a BullMQ queue, persisted in Redis, while core application data resides in MongoDB. The client provides a real-time view of job statuses and repository states, powered by event streaming from the server.


```mermaid
flowchart TD
 client["client(React)"]
 server["server(Express)"]
 subgraph Storage ["Databases & Storage"]
 db_redis[("Redis")]
 db_mongodb[("MongoDB")]
 end
 server -.-> |"Installation"| db_redis
 server -.-> |"InstallationState"| db_redis
 server -.-> |"Job"| db_redis
 server -.-> |"Repository"| db_redis
 server -.-> |"User"| db_redis
 server -.-> |"Redis"| db_redis
 server -.-> |"MongoDB"| db_mongodb
```



---

## 📁 Project Structure

```
.
├── .github/ # GitHub Actions workflows for CI/CD
│ └── workflows
├── client/ # Frontend application (React, Vite)
│ ├── .env.example # Example environment variables for the client
│ ├── index.html # Main HTML entry point for the client
│ ├── package-lock.json # Client's dependency lock file
│ ├── package.json # Client's package dependencies and scripts
│ ├── src # Source code for the React client application
│ ├── tailwind.config.js # Tailwind CSS configuration for the client
│ └── vite.config.js # Vite configuration for the client build process
├── server/ # Backend API application (Node.js, Express)
│ ├── .env.example # Example environment variables for the server
│ ├── nodemon.json # Nodemon configuration for server development
│ ├── package-lock.json # Server's dependency lock file
│ ├── package.json # Server's package dependencies and scripts
│ └── src # Source code for the Express API
│ ├── controllers # API endpoint logic and business operations
│ ├── models # Mongoose schemas and database models
│ ├── routes # API route definitions and handlers
│ └── app.js # Express application setup and middleware
│ └── server.js # Main server entry point
├── README.md # Project README file
├── package-lock.json # Root dependency lock file
├── package.json # Root package dependencies and scripts
├── render.yaml # Render.com deployment configuration
```

---

## ⚙️ Installation & Setup

To get PushDoc running locally, follow these steps:

### 1. **Prerequisites**
Ensure you have the following installed:
- Node.js (v18+)
- npm (usually bundled with Node.js)
- Git
- MongoDB instance (local or remote)
- Redis instance (local or remote)
- A registered GitHub App (for development webhooks and OAuth)

### 2. **Clone & Install Dependencies**

First, clone the repository:
```bash
git clone https://github.com/your-org/pushdoc.git
cd pushdoc
```

Then, install dependencies for both the client and server:
```bash
cd client
npm install
cd ../server
npm install
cd ..
```

### 3. **Environment Setup**

Create `.env` files for both the client and server by copying the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Now, edit `client/.env` and `server/.env` to configure your environment variables. Refer to the [Environment Variables](#-environment-variables) section for details.
**Crucially, set up your GitHub App credentials, Redis URL, and MongoDB URI.**

### 4. **Running Locally**

To start both the frontend client and the backend server:

```bash
# In the root directory, start the client application (Vite dev server)
npm run dev
```
In a separate terminal, navigate to the root directory and start the server application:
```bash
node server/server.js
```

The client application will typically be accessible at `http://localhost:5173` (or similar, as indicated by Vite), and the server API will run on the `PORT` specified in `server/.env`.

### 5. **Production Build**

To build the client application for production:

```bash
cd client
npm run build
```
This will generate optimized static assets in the `client/dist` directory. The server can then be run using `node server/server.js` in a production environment.

---

## 🔐 Environment Variables

Configure these variables in `client/.env` and `server/.env` respectively.

| Variable | Description | Example / Default | Required |
| :------------------------ | :--------------------------------------------------------------------------- | :------------------------------------------ | :------- |
| `NODE_ENV` | Node.js environment mode (`development`, `production`). | `development` | Yes |
| `PORT` | The port the server API will listen on. | `3000` | Yes |
| `CORS_ORIGIN` | Whitelisted origin for Cross-Origin Resource Sharing (CORS). | `http://localhost:5173` | Yes |
| `MONGODB_URI` | Connection string for your MongoDB database. | `mongodb://localhost:27017/pushdoc` | Yes |
| `REDIS_URL` | Connection URL for your Redis instance (for BullMQ and caching). | `redis://localhost:6379` | Yes |
| `REDIS_HOST` | Hostname for Redis connection (alternative to `REDIS_URL`). | `localhost` | No |
| `REDIS_PORT` | Port for Redis connection (alternative to `REDIS_URL`). | `6379` | No |
| `GITHUB_CLIENT_ID` | OAuth App Client ID from your GitHub App. | `Iv1.xxxxxxxxxxxxxxxx` | Yes |
| `GITHUB_CLIENT_SECRET` | OAuth App Client Secret from your GitHub App. | `sk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Yes |
| `GITHUB_REDIRECT_URI` | Redirect URI configured in your GitHub App settings. | `http://localhost:3000/github/callback` | Yes |
| `GITHUB_APP_ID` | Your GitHub App's unique ID. | `123456` | Yes |
| `GITHUB_APP_NAME` | Name of your GitHub App. | `PushDoc` | Yes |
| `GITHUB_WEBHOOK_SECRET` | Secret token for validating GitHub webhooks. | `your_webhook_secret` | Yes |
| `GITHUB_PRIVATE_KEY_PATH` | Path to your GitHub App's private key file (e.g., `github-app-private-key.pem`). | `./github-app-private-key.pem` | Yes |
| `JWT_SECRET` | Secret key for signing and verifying JSON Web Tokens (JWTs). | `super_secret_jwt_key_12345` | Yes |
| `GEMINI_API_KEY_1` | API Key for Google Gemini (1 of 3 possible keys for multi-model fallback). | `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | No |
| `GEMINI_API_KEY_2` | API Key for Google Gemini (2 of 3 possible keys for multi-model fallback). | `AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | No |
| `GEMINI_API_KEY_3` | API Key for Google Gemini (3 of 3 possible keys for multi-model fallback). | `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | No |
| `GROQ_API_KEY_1` | API Key for Groq (1 of 2 possible keys for multi-model fallback). | `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | No |
| `GROQ_API_KEY_2` | API Key for Groq (2 of 2 possible keys for multi-model fallback). | `gsk_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy` | No |
| `WORKSPACE_ROOT_PATH` | Root path for cloning repositories and temporary workspaces for processing. | `./workspace` | Yes |

---

## 🌐 API Reference

All API endpoints are prefixed at the root (`/`).

| Method | Endpoint | Description | Auth Required |
| :------ | :------------------------------- | :------------------------------------------------------------------- | :------------ |
| `GET` | `/github/login` | Initiates the GitHub OAuth login flow. | No |
| `GET` | `/github/callback` | Callback endpoint for GitHub OAuth after successful authentication. | No |
| `GET` | `/me` | Retrieves the authenticated user's profile information. | Yes |
| `POST` | `/logout` | Logs out the currently authenticated user. | Yes |
| `GET` | `/app` | Retrieves information about the GitHub App. | No |
| `GET` | `/install` | Redirects to GitHub for installing the App on a repository or organization. | No |
| `GET` | `/install/callback` | Callback endpoint after GitHub App installation. | No |
| `GET` | `/repositories/sync` | Triggers a synchronization of user's GitHub repositories. | Yes |
| `GET` | `/jobs` | Retrieves a list of all documentation jobs. | Yes |
| `GET` | `/jobs/:jobId/logs` | Fetches logs for a specific documentation job. | Yes |
| `POST` | `/jobs/:jobId/cancel` | Cancels a running or queued documentation job. | Yes |
| `GET` | `/repositories/:repoId/readme` | Fetches the generated README for a specific repository. | Yes |
| `POST` | `/repositories/:repoId/trigger` | Manually triggers a new documentation generation job for a repository. | Yes |
| `GET` | `/events/stream` | Establishes a Server-Sent Events (SSE) stream for real-time updates. | Yes |
| `PATCH` | `/repositories/:repoId/toggle` | Toggles the active status for documentation generation on a repository. | Yes |
| `GET` | `/health` | Checks the overall health and status of the API service. | No |
| `GET` | `/ready` | Checks if the API service is ready to accept requests. | No |
| `GET` | `/` | Root endpoint providing basic API status and Redis health. | No |
| `POST` | `/github` | Webhook endpoint for receiving GitHub events (e.g., `push` events), secured by `GITHUB_WEBHOOK_SECRET`. | No (Webhook Secret) |

---

## 🗄️ Database Models

PushDoc utilizes MongoDB to persist crucial application data across several collections, ensuring a reliable state for all operations.

| Model | Key Fields | Purpose & System Relationships |
| :---------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `Installation` | `installationId`, `user`, `accountLogin`, `accountType` | Records GitHub App installations, linking to a `User` and associated `Repository` instances. |
| `InstallationState` | `state`, `user`, `expiresAt` | Manages temporary states during the GitHub App installation OAuth flow for a `User`. |
| `Job` | `repository`, `bullJobId`, `commitSha`, `branch`, `status`, `generatedReadme`, `validationScore` | Tracks asynchronous documentation generation tasks for a specific `Repository`, including its output and quality metrics. |
| `Repository` | `githubId`, `installation`, `name`, `fullName`, `owner`, `isActive`, `cloneUrl` | Stores details of GitHub repositories managed by the app, linked to an `Installation`. |
| `User` | `githubId`, `username`, `email`, `avatarUrl`, `githubAccessToken` | Stores user profiles authenticated via GitHub OAuth, enabling personalized experiences. |

---

## 📜 Available Scripts

These scripts are defined in the root `package.json` and are primarily for managing the client-side application using Vite.

- `npm run dev`: Starts the Vite development server for the client application, enabling hot module replacement and efficient development.
- `npm run start`: An alias for `npm run dev`, also starts the Vite development server for the client application.
- `npm run build`: Compiles and bundles the client application for production deployment, generating optimized static assets.