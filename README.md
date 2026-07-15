# 🚀 PushDoc

> PushDoc is a GitHub App that automatically generates and commits professional `README.md` files to your repositories using AI, triggered by code pushes or on demand. It provides a comprehensive dashboard for managing installations, repositories, and documentation jobs.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-D21C1C?style=for-the-badge&logo=redis&logoColor=white)
![Parcel](https://img.shields.io/badge/Parcel-F7D040?style=for-the-badge&logo=parcel&logoColor=black)
![Google Generative AI](https://img.shields.io/badge/Google_Generative_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-FF3D00?style=for-the-badge&logo=groq&logoColor=white)
![Simple-Git](https://img.shields.io/badge/Simple--Git-F05033?style=for-the-badge&logo=git&logoColor=white)

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
*   **AI-Powered README Generation**: Automatically creates and updates `README.md` files using advanced AI models (Gemini, Groq) based on deep repository analysis.
*   **Automated GitHub Integration**: Functions as a GitHub App, monitoring webhook events (like `push` to the default branch) to automatically trigger README updates, keeping documentation current.
*   **Manual Documentation Builds**: Allows users to manually initiate a README generation job for any installed repository via the API, offering on-demand documentation updates.
*   **Real-time Job Tracking**: Provides a dashboard-like view (implied by `stitch_assets/PushDoc_Build_History_Logs.html` and API routes) to monitor the status and progress of all README generation jobs.
*   **Detailed Job Logs**: Access to step-by-step logs for each README generation job, aiding in debugging and understanding the documentation process.
*   **Seamless GitHub App Installation**: Guides users through installing the GitHub App and connecting their repositories, managing installation states and associated repositories.
*   **User & Repository Management**: Securely manages user profiles, GitHub App installations, and synced repositories within the application database.
*   **Background Job Processing**: Utilizes a robust queueing system (BullMQ with Redis) to handle computationally intensive README generation jobs efficiently in the background, ensuring scalability and responsiveness.
*   **Repository Analysis & Context Building**: Analyzes repository structure, code, and existing documentation to build comprehensive context, enabling the AI to generate relevant and accurate `README.md` files.
*   **Secure GitHub Webhook Processing**: Verifies incoming GitHub webhooks using HMAC signatures to ensure authenticity and prevent tampering.
*   **Authentication & Authorization**: Implements GitHub OAuth for secure user login and JWT-based authentication for API access.

---

## 🛠️ Tech Stack

| Category              | Technology                 | Purpose                                           |
| :-------------------- | :------------------------- | :------------------------------------------------ |
| **Backend Runtime**   | Node.js                    | Server-side JavaScript execution environment      |
| **Backend Framework** | Express                    | Web application framework for API development     |
| **Frontend Framework**| React                      | Declarative UI library for building user interfaces |
| **Database**          | MongoDB (via Mongoose)     | NoSQL database for flexible data storage          |
| **Queueing System**   | BullMQ                     | Robust job queue for background processing        |
| **Queue Backend**     | Redis (via ioredis)        | In-memory data store for job queue and cache      |
| **AI/LLM Providers**  | Google Generative AI (Gemini) | AI model for content generation                  |
| **AI/LLM Providers**  | Groq SDK                   | High-performance AI model inference platform     |
| **Authentication**    | JSON Web Tokens (JWT)      | Secure, stateless user authentication             |
| **GitHub Integration**| Octokit (`@octokit/app`, `@octokit/rest`) | GitHub API client and App framework         |
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
│   └── src/                    # Client source code
├── server/                     # Backend server application (Node.js/Express)
│   ├── .env.example            # Example environment variables for server
│   ├── nodemon.json            # Nodemon configuration
│   ├── package-lock.json       # Locks server dependency versions
│   ├── package.json            # Server dependencies and scripts
│   ├── server.js               # Server entry point, config validation, DB connection
│   └── src/                    # Server source code
│       ├── app.js              # Express app setup, middleware, and route loading
│       ├── config/             # Application configuration files (AI, app, DB, GitHub)
│       ├── controllers/        # HTTP request handlers for API routes
│       ├── middleware/         # Custom Express middleware (e.g., authentication)
│       ├── models/             # Mongoose database schemas (Installation, Job, Repository, User, etc.)
│       ├── pipelines/          # Defines multi-step data processing flows (e.g., readme generation)
│       ├── queue/              # BullMQ queue configuration and Redis connection
│       ├── routes/             # API route definitions
│       ├── services/           # Business logic, external integrations (AI, Git, GitHub, JWT, Logger, Webhook, Workspace)
│       └── workers/            # BullMQ job processors (e.g., readme.worker.js for background README generation)
├── stitch_assets/              # Static assets or example HTML for UI concepts/prototypes
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
    To start the server in development mode:
    ```bash
    cd server
    npm run dev
    ```
    To start the client development server:
    ```bash
    cd client
    npm start
    ```
    Ensure both the server and client are running for full functionality.

---

## 🔐 Environment Variables

The `server/.env.example` file outlines the necessary environment variables for the server application. These variables are crucial for connecting to databases, authenticating with GitHub, and configuring AI providers.

| Variable              | Required | Description                                                                                                                                                                                                            |
| :-------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`            | No       | Application environment (e.g., `development`, `production`). Defaults to `development`.                                                                                                                                |
| `PORT`                | No       | Port for the server to listen on. Defaults to `3000`.                                                                                                                                                                  |
| `MONGODB_URI`         | Yes      | Connection URI for MongoDB. This is critical for database operations.                                                                                                                                                  |
| `REDIS_HOST`          | No       | Host for the Redis server, used by BullMQ for the job queue and for OAuth state management. Defaults to `127.0.0.1`.                                                                                                 |
| `REDIS_PORT`          | No       | Port for the Redis server. Defaults to `6379`.                                                                                                                                                                         |
| `GITHUB_APP_ID`       | Yes      | Your GitHub App's ID. Required for GitHub App functionality.                                                                                                                                                           |
| `GITHUB_CLIENT_ID`    | Yes      | Your GitHub OAuth App Client ID. Used for user authentication.                                                                                                                                                         |
| `GITHUB_CLIENT_SECRET`| Yes      | Your GitHub OAuth App Client Secret. Used for user authentication.                                                                                                                                                     |
| `GITHUB_REDIRECT_URI` | Yes      | The redirect URI configured for your GitHub OAuth App, where GitHub will send users back after authentication.                                                                                                         |
| `GITHUB_WEBHOOK_SECRET`| Yes      | A secret string used to verify GitHub webhook payloads, ensuring their authenticity.                                                                                                                                   |
| `GITHUB_APP_NAME`     | Yes      | The name of your GitHub App, used to construct installation URLs.                                                                                                                                                      |
| `GEMINI_API_KEY_1`    | No       | API key for Google Gemini. At least one AI key (Gemini or Groq) is required for README generation.                                                                                                                     |
| `GEMINI_API_KEY_2`    | No       | Additional API key for Google Gemini for load balancing or fallback.                                                                                                                                                   |
| `GEMINI_API_KEY_3`    | No       | Additional API key for Google Gemini.                                                                                                                                                                                  |
| `GROQ_API_KEY_1`      | No       | API key for Groq. At least one AI key (Gemini or Groq) is required for README generation.                                                                                                                              |
| `GROQ_API_KEY_2`      | No       | Additional API key for Groq for load balancing or fallback.                                                                                                                                                            |
| `CORS_ORIGIN`         | No       | Allowed origin for CORS requests to the API. Defaults to `http://localhost:1234` for local development.                                                                                                                |
| `WORKSPACE_ROOT_PATH` | No       | Absolute path for temporary workspaces where repositories are cloned. Defaults to OS temp dir in production, or `temp/workspaces` in development.                                                                        |
| `JWT_SECRET`          | Yes      | Secret key for signing and verifying JSON Web Tokens. Essential for user session security and authentication.                                                                                                          |

---

## 🌐 API Reference

PushDoc provides a RESTful API for managing GitHub App installations, repositories, and documentation jobs.

| Method | Endpoint                             | Auth Required | Description                                                                         |
| :----- | :----------------------------------- | :------------ | :---------------------------------------------------------------------------------- |
| `GET`  | `/`                                  | No            | Indicates the PushDoc API is running successfully.                                  |
| `GET`  | `/auth/github/login`                 | No            | Initiates the GitHub OAuth login flow for user authentication.                      |
| `GET`  | `/auth/github/callback`              | No            | Callback endpoint for GitHub OAuth, processes the authorization code.               |
| `GET`  | `/github/app`                        | Yes           | Checks the initialization status of the GitHub App.                                 |
| `GET`  | `/github/install`                    | Yes           | Redirects the user to the GitHub App installation page.                             |
| `GET`  | `/github/install/callback`           | No            | Callback endpoint after the GitHub App has been installed by a user.                |
| `GET`  | `/github/repositories/sync`          | Yes           | Syncs the repositories from the installed GitHub App to the application database.   |
| `GET`  | `/github/jobs`                       | Yes           | Retrieves a list of README generation jobs associated with the user's installation. |
| `GET`  | `/github/jobs/:jobId/logs`           | Yes           | Retrieves detailed logs for a specific README generation job.                       |
| `POST` | `/github/repositories/:repoId/trigger` | Yes           | Triggers a manual README build for a specified repository.                          |
| `POST` | `/webhooks/github`                   | No            | Receives and processes GitHub webhook events (e.g., `push` events).                 |

---

## 🗄️ Database Models

PushDoc uses MongoDB to store information about users, GitHub App installations, repositories, and documentation jobs.

### Model: `Installation` (Collection: `installations`)
Represents a GitHub App installation on a user's account or organization.

| Field          | Type     | Attributes                 |
| :------------- | :------- | :------------------------- |
| `installationId` | `Number`   | `required`, `unique`       |
| `user`         | `ObjectId` | `required`, `ref: User`    |
| `accountLogin` | `String`   |                            |
| `accountType`  | `String`   |                            |

### Model: `InstallationState` (Collection: `installationstates`)
Temporarily stores state information during the GitHub App installation process for security.

| Field       | Type     | Attributes                 |
| :---------- | :------- | :------------------------- |
| `state`     | `String`   | `required`, `unique`       |
| `user`      | `ObjectId` | `required`, `ref: User`    |
| `expiresAt` | `Date`     | `required`, `expires: 0`   |

### Model: `Job` (Collection: `jobs`)
Tracks the status and details of each README generation job.

| Field              | Type          | Attributes                                                                                        |
| :----------------- | :------------ | :------------------------------------------------------------------------------------------------ |
| `repository`       | `ObjectId`      | `required`, `ref: Repository`                                                                     |
| `bullJobId`        | `String`        | `required`, `unique` (ID from BullMQ)                                                             |
| `commitSha`        | `String`        | `required` (SHA of the commit that triggered the job)                                             |
| `branch`           | `String`        | `required` (Branch where the job was triggered)                                                   |
| `status`           | `String`        | `default: "QUEUED"`, `enum: [QUEUED, CLONING, READING, GENERATING, WRITING, COMMITTING, PUSHING, COMPLETED, FAILED]` |
| `startedAt`        | `Date`          | Timestamp when the job started                                                                    |
| `completedAt`      | `Date`          | Timestamp when the job completed                                                                  |
| `duration`         | `Number`        | Duration of the job in milliseconds                                                               |
| `error`            | `String`        | Error message if the job failed                                                                   |
| `originalReadme`   | `String`        | Content of the README before generation (if it existed)                                           |
| `generatedReadme`  | `String`        | Content of the AI-generated README                                                                |
| `validationScore`  | `Number`        | Score indicating the quality and validity of the generated README                                 |
| `validationWarnings`| `Array<String>` | Warnings or suggestions from README validation                                                    |

### Model: `Repository` (Collection: `repositories`)
Stores details about GitHub repositories connected to a PushDoc installation.

| Field          | Type      | Attributes                 |
| :------------- | :-------- | :------------------------- |
| `githubId`     | `Number`    | `required`, `unique`       |
| `installation` | `ObjectId`  | `required`, `ref: Installation`, `index: true` |
| `name`         | `String`    | `required`                 |
| `fullName`     | `String`    | `required`                 |
| `owner`        | `String`    | `required`                 |
| `private`      | `Boolean`   | `required`                 |
| `cloneUrl`     | `String`    | `required`                 |

### Model: `User` (Collection: `users`)
Stores user profiles, primarily linked to their GitHub accounts.

| Field               | Type     | Attributes                 |
| :------------------ | :------- | :------------------------- |
| `githubId`          | `Number`   | `required`, `unique`       |
| `username`          | `String`   | `required`                 |
| `displayName`       | `String`   |                            |
| `email`             | `String`   |                            |
| `avatarUrl`         | `String`   |                            |
| `githubAccessToken` | `String`   | `required`                 |
| `provider`          | `String`   | `default: "github"`        |

---

## 📜 Available Scripts

The project includes several `npm` scripts to facilitate development and deployment.

### Root `package.json`

*   No specific scripts available in the root `package.json` beyond default test, which reports "Error: no test specified".

### Server (`server/package.json`)

*   `npm run dev`: Starts the Node.js server using `nodemon`, enabling automatic restarts on file changes for development.
*   `npm start`: Starts the Node.js server in production mode (or specified `NODE_ENV`).

### Client (`client/package.json`)

*   `npm start`: Starts the client-side development server using Parcel, typically served at `http://localhost:1234`.
*   `npm run build`: Builds the client-side application for production deployment using Parcel.