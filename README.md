# 🚀 PushDoc

> PushDoc is a GitHub App that automatically generates and commits professional `README.md` files to your repositories using AI, triggered by code pushes or on demand. It provides a comprehensive dashboard for managing installations, repositories, and documentation jobs.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white) ![BullMQ](https://img.shields.io/badge/BullMQ-D21C1C?style=for-the-badge&logo=redis&logoColor=white) ![Parcel](https://img.shields.io/badge/Parcel-F7D040?style=for-the-badge&logo=parcel&logoColor=black) ![Google Generative AI](https://img.shields.io/badge/Google_Generative_AI-4285F4?style=for-the-badge&logo=google&logoColor=white) ![Groq](https://img.shields.io/badge/Groq-FF3D00?style=for-the-badge&logo=groq&logoColor=white) ![Simple-Git](https://img.shields.io/badge/Simple--Git-F05033?style=for-the-badge&logo=git&logoColor=white)

---

## 📋 Table of Contents
*   [✨ Features](#-features)
*   [🛠️ Tech Stack](#️-tech-stack)
*   [📁 Project Structure](#-project-structure)
*   [⚙️ Installation & Setup](#️-installation--setup)
*   [🔐 Environment Variables](#-environment-variables)
*   [🌐 API Reference](#-api-reference)
*   [🗄️ Database Models](#-database-models)
*   [📜 Available Scripts](#-available-scripts)

---

## ✨ Features
*   **AI-Powered README Generation**: Automatically crafts and updates `README.md` files using advanced AI models (Google Generative AI, Groq) that analyze your repository's structure and content.
*   **Automated GitHub Integration**: Functions as a GitHub App, monitoring `push` webhook events to the default branch to automatically trigger README updates, ensuring your documentation is always current.
*   **Manual Documentation Builds**: Initiate on-demand README generation for any installed repository via the API, providing flexibility for documentation updates outside of automatic triggers.
*   **Real-time Job Tracking**: Monitor the status and progress of all README generation jobs through an intuitive interface, from queueing to completion or failure.
*   **Detailed Job Logs**: Access comprehensive, step-by-step logs for each documentation job, aiding in understanding the generation process and troubleshooting issues.
*   **Seamless GitHub App Installation**: Guides users through connecting their GitHub account, installing the PushDoc App, and managing authorized repositories.
*   **User & Repository Management**: Securely manages user profiles, GitHub App installations, and synced repositories within the application database.
*   **Toggle Repository Automation**: Activate or deactivate AI-driven README updates for specific repositories, giving you granular control over documentation automation.
*   **Background Job Processing**: Utilizes a robust job queue (BullMQ with Redis) to efficiently handle computationally intensive README generation in the background, ensuring application responsiveness.
*   **Repository Analysis & Context Building**: Intelligently analyzes repository structure and existing content to build rich context, enabling the AI to generate relevant and accurate `README.md` files.
*   **Secure GitHub Webhook Processing**: Authenticates incoming GitHub webhooks using HMAC signatures to guarantee the integrity and origin of all event data.
*   **Authentication & Authorization**: Implements secure user login via GitHub OAuth and protects API endpoints with JWT-based authentication.

---

## 🛠️ Tech Stack

| Category              | Technology                 | Purpose                                           |
| :-------------------- | :------------------------- | :------------------------------------------------ |
| **Backend Runtime**   | Node.js                    | Server-side JavaScript execution environment      |
| **Backend Framework** | Express                    | Web application framework for API development     |
| **Frontend Framework**| React                      | Declarative UI library for building user interfaces |
| **Database**          | MongoDB (via Mongoose)     | NoSQL database for flexible data storage          |
| **Queueing System**   | BullMQ                     | Robust job queue for background processing        |
| **Queue Backend**     | Redis                      | In-memory data store for job queue and OAuth states |
| **AI/LLM Providers**  | Google Generative AI       | AI model for content generation                  |
| **AI/LLM Providers**  | Groq                       | High-performance AI model inference platform     |
| **Authentication**    | JSON Web Tokens (JWT)      | Secure, stateless user authentication             |
| **GitHub Integration**| GitHub App (Octokit)       | Framework and API client for GitHub App features |
| **Version Control Ops**| Simple-Git                 | Programmatic Git operations (cloning, committing) |
| **Environment Config**| Dotenv                     | Loads environment variables from `.env` file      |
| **Logging**           | Morgan                     | HTTP request logger middleware                    |
| **Dev Tools**         | Nodemon                    | Automatically restarts Node.js server on changes  |
| **Frontend Bundler**  | Parcel                     | Fast, zero-config web application bundler         |
| **API Security**      | Express-Rate-Limit         | Middleware for rate-limiting API requests         |

---

## 📁 Project Structure

```
pushdoc/
├── client/                     # Frontend client application (React)
│   ├── package-lock.json       # Locks client dependency versions
│   ├── package.json            # Client dependencies and scripts
│   └── src                     # Client source code
├── server/                     # Backend server application (Node.js/Express)
│   ├── .env.example            # Example environment variables for server
│   ├── nodemon.json            # Nodemon configuration for development
│   ├── package-lock.json       # Locks server dependency versions
│   ├── package.json            # Server dependencies and scripts
│   ├── server.js               # Server entry point and configuration
│   └── src                     # Server source code
│       ├── config/             # Application configuration files
│       ├── controllers/        # HTTP request handlers for API routes
│       ├── middleware/         # Custom Express middleware (e.g., authentication)
│       ├── models/             # Mongoose database schemas
│       ├── pipelines/          # Defines multi-step data processing flows (e.g., readme generation)
│       ├── queue/              # BullMQ queue configuration and connection
│       ├── routes/             # API route definitions
│       ├── services/           # Business logic and external integrations
│       └── workers/            # BullMQ job processors (e.g., readme generation)
├── README.md                   # This README file
├── package-lock.json           # Locks root project dependency versions
└── package.json                # Root project dependencies and scripts
```

---

## ⚙️ Installation & Setup

To get PushDoc up and running on your local machine, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/SudeepKagi/PushDoc.git
    cd PushDoc
    ```

2.  **Install root dependencies**:
    ```bash
    npm install
    ```

3.  **Install server dependencies**:
    Navigate to the `server` directory and install its dependencies.
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Install client dependencies**:
    Navigate to the `client` directory and install its dependencies.
    ```bash
    cd client
    npm install
    cd ..
    ```

5.  **Configure environment variables**:
    Create a `.env` file inside the `server/` directory. Copy the contents from `server/.env.example` into your new `.env` file and fill in the required values. Refer to the [Environment Variables](#-environment-variables) section for details on each variable.

6.  **Run the application**:
    To start the backend server in development mode:
    ```bash
    cd server
    npm run dev
    # Or, to run the server in production mode:
    # npm start
    cd ..
    ```
    To start the frontend client development server:
    ```bash
    cd client
    npm start
    # Or, from the project root to start both (server in prod mode, client in dev mode):
    # npm start
    cd ..
    ```
    Ensure both the server and client are running for full functionality.

---

## 🔐 Environment Variables

The `server/.env.example` file outlines the necessary environment variables for the server application. These variables are crucial for connecting to databases, authenticating with GitHub, and configuring AI providers.

| Variable | Required | Description |
| :------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV` | No | Application environment (e.g., `development`, `production`). Defaults to `development`. |
| `PORT` | No | Port for the server to listen on. Defaults to `3000`. |
| `MONGODB_URI` | Yes | Connection URI for MongoDB. This is critical for database operations. |
| `REDIS_HOST` | No | Host for the Redis server, used by BullMQ for the job queue and for OAuth state management. Defaults to `127.0.0.1`. |
| `REDIS_PORT` | No | Port for the Redis server. Defaults to `6379`. |
| `GITHUB_APP_ID` | Yes | Your GitHub App's ID. Required for GitHub App functionality. |
| `GITHUB_CLIENT_ID` | Yes | Your GitHub OAuth App Client ID. Used for user authentication. |
| `GITHUB_CLIENT_SECRET` | Yes | Your GitHub OAuth App Client Secret. Used for user authentication. |

---

## 🌐 API Reference

The PushDoc API provides endpoints for authentication, GitHub App management, repository synchronization, and job tracking.

| Method | Endpoint | Auth | Description |
| :----- | :----------------------------- | :--- | :--------------------------------------------------- |
| `GET` | `/` | No | Check if the API is running. |
| `GET` | `/auth/github/login` | No | Initiates GitHub OAuth login flow. |
| `GET` | `/auth/github/callback` | No | Handles GitHub OAuth callback and issues JWT. |
| `GET` | `/github/app` | Yes | Checks GitHub App initialization status. |
| `GET` | `/github/install` | Yes | Redirects to GitHub App installation page. |
| `GET` | `/github/install/callback` | No | Handles GitHub App installation callback. |
| `GET` | `/github/repositories/sync` | Yes | Synchronizes installed GitHub repositories with the DB. |
| `GET` | `/github/jobs` | Yes | Retrieves a list of README generation jobs. |
| `GET` | `/github/jobs/:jobId/logs` | Yes | Fetches logs for a specific README generation job. |
| `POST` | `/github/repositories/:repoId/trigger` | Yes | Manually triggers a README generation job for a repository. |
| `PATCH` | `/github/repositories/:repoId/toggle` | Yes | Toggles the active status of a repository for automation. |
| `POST` | `/webhooks/github` | No | Endpoint for GitHub webhook events (e.g., `push`). |

---

## 🗄️ Database Models

PushDoc uses MongoDB to persist data related to users, GitHub App installations, repositories, and README generation jobs.

| Model | Key Fields | Description |
| :---------------- | :----------------------------- | :--------------------------------------------------- |
| `Installation` | `installationId`, `user` | Stores GitHub App installation details. |
| `InstallationState` | `state`, `user`, `expiresAt` | Manages temporary states for GitHub App installation flow. |
| `Job` | `repository`, `bullJobId`, `status` | Tracks the lifecycle and details of a README generation job. |
| `Repository` | `githubId`, `installation`, `fullName` | Stores information about a GitHub repository integrated with PushDoc. |
| `User` | `githubId`, `username`, `githubAccessToken` | Represents a user authenticated via GitHub. |

---

## 📜 Available Scripts

The project includes several `npm` scripts to streamline development and building processes.

**Root `package.json` scripts:**
*   `npm test`: Placeholder for running tests.
*   `npm run build:client`: Builds the frontend client application.
*   `npm run start:server`: Starts the backend server in production mode.
*   `npm run build`: Executes `build:client`.
*   `npm start`: Executes `start:server`.

**`client/package.json` scripts:**
*   `npm start`: Starts the client development server using Parcel.
*   `npm run build`: Builds the client for production.

**`server/package.json` scripts:**
*   `npm run dev`: Starts the server in development mode with `nodemon` for auto-reloading.
*   `npm start`: Starts the server in production mode.

---