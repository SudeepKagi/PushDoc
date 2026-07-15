# 🚀 pushdoc

> This project is an Express.js application for managing installations, installation states, jobs, and repositories, with user authentication. It features a backend API and a frontend client.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![ISC License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)

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

*   **Authentication**: Users can register, login and logout.
*   **Installation Management**: Provides database storage and operations for managing installations.
*   **InstallationState Management**: Provides database storage and operations for managing installationstates.
*   **Job Management**: Provides database storage and operations for managing jobs.
*   **Repository Management**: Provides database storage and operations for managing repositories.

---

## 🛠️ Tech Stack

| Category         | Technology                 |
| :--------------- | :------------------------- |
| **Backend**      | Node.js                    |
| **Framework**    | Express                    |
| **Frontend**     | React                      |
| **Database**     | MongoDB (via Mongoose)     |
| **Queueing/Cache** | BullMQ, Redis            |
| **Authentication** | JSON Web Tokens (JWT)      |
| **GitHub Integration** | Octokit                  |
| **AI/LLM**       | Google Generative AI       |
| **AI/LLM**       | Groq SDK                   |
| **Version Control** | Simple-Git                |
| **Environment Management** | Dotenv             |
| **Logging**      | Morgan                     |
| **Rate Limiting** | Express-Rate-Limit         |
| **Bundler**      | Parcel                     |

---

## 📁 Project Structure

```
.
├── client/                     # Frontend client application
│   ├── src/                    # Client source code
│   │   └── index.html
│   ├── package-lock.json
│   └── package.json
├── server/                     # Backend server application
│   ├── .env.example
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js               # Server entry point
│   └── src/                    # Server source code
│       ├── app.js
│       ├── config/             # Application configuration
│       │   ├── ai.config.js
│       │   ├── app.config.js
│       │   ├── database.js
│       │   └── github.js
│       ├── controllers/        # API controllers
│       │   ├── auth.controller.js
│       │   ├── github.controller.js
│       │   └── webhook.controller.js
│       ├── middleware/         # Custom Express middleware
│       │   └── auth.middleware.js
│       ├── models/             # Mongoose database models
│       │   ├── installation.model.js
│       │   ├── installationState.model.js
│       │   ├── job.model.js
│       │   ├── repository.model.js
│       │   └── user.model.js
│       ├── pipelines/          # Data processing pipelines
│       │   └── readme.pipeline.js
│       ├── queue/              # Queue configuration
│       │   └── connection.js
│       ├── routes/             # API route definitions
│       │   ├── auth.js
│       │   ├── github.js
│       │   ├── index.js
│       │   └── webhook.js
│       ├── services/           # Reusable service modules
│       │   ├── ai.service.js
│       │   ├── auth.service.js
│       │   ├── git.service.js
│       │   ├── github.service.js
│       │   ├── installation.service.js
│       │   ├── installationState.service.js
│       │   ├── job.service.js
│       │   ├── jwt.service.js
│       │   ├── logger.service.js
│       │   ├── readme.service.js
│       │   ├── repository.service.js
│       │   ├── user.service.js
│       │   └── webhook.service.js
│       └── workers/            # BullMQ job workers
│           └── readme.worker.js
├── stitch_assets/
│   ├── 56aa4553f2df4f63bed3ce20c6c291ae_PushDoc_Repository_Settings.html
│   ├── 8a3f8d87d8414825a83c4b3be111b016_PushDoc_AI_Provider_Management.html
│   ├── a21a7fa9b6d24896a9ab54543530fbd9_PushDoc_Automated_Documentation_SaaS.html
│   └── eb879a80993d41c882603d267291e6b8_PushDoc_Build_History_Logs.html
├── README.md
├── package-lock.json
└── package.json
```

---

## ⚙️ Installation & Setup

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
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Install client dependencies**:
    ```bash
    cd client
    npm install
    cd ..
    ```

5.  **Configure environment variables**:
    Create a `.env` file in the `server/` directory based on `server/.env.example` and fill in the required values. See the [Environment Variables](#-environment-variables) section for details.

---

## 🔐 Environment Variables

The `server/.env.example` file outlines the necessary environment variables for the server application.

| Variable             | Required | Description                                                                         |
| :------------------- | :------- | :---------------------------------------------------------------------------------- |
| `NODE_ENV`           | No       | Application environment (e.g., `development`, `production`). Defaults to `development`. |
| `PORT`               | No       | Port for the server to listen on. Defaults to `3000`.                               |
| `MONGODB_URI`        | Yes      | Connection URI for MongoDB.                                                         |
| `REDIS_HOST`         | No       | Host for the Redis server. Defaults to `127.0.0.1`.                                 |
| `REDIS_PORT`         | No       | Port for the Redis server. Defaults to `6379`.                                      |
| `GITHUB_APP_ID`      | Yes      | GitHub App ID.                                                                      |
| `GITHUB_CLIENT_ID`   | Yes      | GitHub OAuth App Client ID.                                                         |
| `GITHUB_CLIENT_SECRET` | Yes      | GitHub OAuth App Client Secret.                                                     |
| `GITHUB_REDIRECT_URI` | Yes      | GitHub OAuth App Redirect URI.                                                      |
| `GITHUB_WEBHOOK_SECRET` | Yes      | Secret used to verify GitHub webhook payloads.                                      |
| `GITHUB_APP_NAME`    | Yes      | Name of the GitHub App, used to construct installation URLs.                        |
| `GEMINI_API_KEY_1`   | No       | API key for Google Gemini. At least one AI key (Gemini or Groq) is required.        |
| `GEMINI_API_KEY_2`   | No       | Additional API key for Google Gemini.                                               |
| `GEMINI_API_KEY_3`   | No       | Additional API key for Google Gemini.                                               |
| `GROQ_API_KEY_1`     | No       | API key for Groq. At least one AI key (Gemini or Groq) is required.                 |
| `GROQ_API_KEY_2`     | No       | Additional API key for Groq.                                                        |
| `CORS_ORIGIN`        | No       | Allowed origin for CORS requests. Defaults to `http://localhost:1234`.              |
| `WORKSPACE_ROOT_PATH` | No       | Absolute path for temporary workspaces. Defaults to OS temp dir in production, `temp/workspaces` in development. |
| `JWT_SECRET`         | Yes      | Secret key for signing and verifying JSON Web Tokens.                               |

---

## 🌐 API Reference

| Method | Endpoint                       | Description                                                     | Auth Required |
| :----- | :----------------------------- | :-------------------------------------------------------------- | :------------ |
| `GET`  | `/`                            | Indicates the PushDoc API is running.                           | No            |
| `GET`  | `/auth/github/login`           | Initiates GitHub OAuth login flow.                              | No            |
| `GET`  | `/auth/github/callback`        | Callback endpoint for GitHub OAuth.                             | No            |
| `GET`  | `/github/app`                  | Checks GitHub App initialization.                               | Yes           |
| `GET`  | `/github/install`              | Redirects to GitHub App installation page.                      | Yes           |
| `GET`  | `/github/install/callback`     | Callback endpoint after GitHub App installation.                | No            |
| `GET`  | `/github/repositories/sync`    | Syncs repositories from GitHub App installation to database.    | Yes           |
| `GET`  | `/github/jobs`                 | Retrieves jobs associated with the user's installation.         | Yes           |
| `GET`  | `/github/jobs/:jobId/logs`     | Retrieves logs for a specific job.                              | Yes           |
| `POST` | `/github/repositories/:repoId/trigger` | Triggers a manual README build for a specified repository.    | Yes           |
| `POST` | `/webhooks/github`             | Receives and processes GitHub webhook events.                   | No            |

---

## 🗄️ Database Models

### Model: `Installation` (Collection: `installations`)

| Field          | Type     | Attributes                 |
| :------------- | :------- | :------------------------- |
| `installationId` | Number   | `required`, `unique`       |
| `user`         | ObjectId | `required`, `ref: User`    |
| `accountLogin` | String   |                            |
| `accountType`  | String   |                            |

### Model: `InstallationState` (Collection: `installationstates`)

| Field       | Type     | Attributes                 |
| :---------- | :------- | :------------------------- |
| `state`     | String   | `required`, `unique`       |
| `user`      | ObjectId | `required`, `ref: User`    |
| `expiresAt` | Date     | `required`, `expires: 0`   |

### Model: `Job` (Collection: `jobs`)

| Field              | Type          | Attributes                                                                                             |
| :----------------- | :------------ | :----------------------------------------------------------------------------------------------------- |
| `repository`       | ObjectId      | `required`, `ref: Repository`                                                                          |
| `bullJobId`        | String        | `required`, `unique`                                                                                   |
| `commitSha`        | String        | `required`                                                                                             |
| `branch`           | String        | `required`                                                                                             |
| `status`           | String        | `default: "QUEUED"`, `enum: [QUEUED, CLONING, READING, GENERATING, WRITING, COMMITTING, PUSHING, COMPLETED, FAILED]` |
| `startedAt`        | Date          |                                                                                                        |
| `completedAt`      | Date          |                                                                                                        |
| `duration`         | Number        |                                                                                                        |
| `error`            | String        |                                                                                                        |
| `originalReadme`   | String        |                                                                                                        |
| `generatedReadme`  | String        |                                                                                                        |
| `validationScore`  | Number        |                                                                                                        |
| `validationWarnings` | Array<String> |                                                                                                        |

### Model: `Repository` (Collection: `repositories`)

| Field        | Type      | Attributes                 |
| :----------- | :-------- | :------------------------- |
| `githubId`   | Number    | `required`, `unique`       |
| `installation` | ObjectId  | `required`, `ref: Installation`, `index` |
| `name`       | String    | `required`                 |
| `fullName`   | String    | `required`                 |
| `owner`      | String    | `required`                 |
| `private`    | Boolean   | `required`                 |
| `cloneUrl`   | String    | `required`                 |

### Model: `User` (Collection: `users`)

| Field             | Type     | Attributes                 |
| :---------------- | :------- | :------------------------- |
| `githubId`        | Number   | `required`, `unique`       |
| `username`        | String   | `required`                 |
| `displayName`     | String   |                            |
| `email`           | String   |                            |
| `avatarUrl`       | String   |                            |
| `githubAccessToken` | String   | `required`                 |
| `provider`        | String   | `default: "github"`        |

---

## 📜 Available Scripts

These scripts can be run from their respective directories (`client/` for client scripts, `server/` for server scripts, and the root for root scripts).

### Root Project Scripts

*   `test`: `echo "Error: no test specified" && exit 1`
    > Currently, this is a placeholder script.

### Client Scripts

*   `start`: `parcel src/index.html`
    > Starts the client development server, typically accessible at `http://localhost:1234`.
*   `build`: `parcel build src/index.html`
    > Builds the client application for production deployment.

### Server Scripts

*   `dev`: `nodemon server.js`
    > Starts the server in development mode with `nodemon` for automatic restarts on file changes.
*   `start`: `node server.js`
    > Starts the server in production mode.