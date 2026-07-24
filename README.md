✨ PushDoc

> PushDoc is a GitHub App and web interface that empowers developers to effortlessly generate and update professional README.md files for their repositories using advanced AI models. It streamlines documentation by automating the README creation process, tracking generation jobs, and providing full control over repository-specific settings.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📋 Table of Contents
* [✨ Features](#-features)
* [🛠️ Tech Stack](#-tech-stack)
* [📁 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#%EF%B8%8F-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🌐 API Reference](#-api-reference)
* [🗄️ Database Models](#-database-models)

---

## ✨ Features

* **AI-Powered README Generation**: Leverages advanced AI models (Gemini, Groq) to automatically draft and refine professional README.md files based on repository content and structure.
* **Seamless GitHub Integration**: Functions as a GitHub App, providing secure and efficient integration for repository access, webhook handling, and direct README commit capabilities.
* **Automated & Manual Builds**: Supports automatic README updates triggered by GitHub webhooks and offers an option to manually initiate README generation for any active repository.
* **Repository Management**: Users can sync their GitHub repositories, activate or deactivate PushDoc for specific repositories, and manage their documentation preferences through a dedicated web interface.
* **Job Monitoring & Logs**: Provides a comprehensive overview of all README generation jobs, including real-time status updates, detailed execution logs, and validation scores for generated content.
* **Secure GitHub Authentication**: Enables users to securely authenticate and authorize PushDoc using their GitHub accounts.
* **Installation Management**: Manages multiple GitHub App installations, allowing users to configure PushDoc across different GitHub organizations or personal accounts.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :-------------- | :------------ | :------------------------------------------ |
| **Backend** | Node.js | JavaScript runtime environment |
| | Express | Web application framework |
| | MongoDB | NoSQL database for data storage |
| | Redis | In-memory data store for caching & queuing |
| | JWT | Secure user authentication |
| **Frontend** | JavaScript | Programming language for client-side logic |
| | React | UI library for building interactive interfaces |
| | Vite | Next-generation frontend tooling |
| | Tailwind CSS | Utility-first CSS framework |
| **AI Integration** | Gemini API | AI model for content generation |
| | Groq API | AI model for content generation |
| **DevOps** | npm | Package manager |

---

## 📁 Project Structure

```
.
├── client/ # Frontend application built with React and Vite
│ ├── index.html # Main HTML file for the client
│ ├── package-lock.json
│ ├── package.json # Frontend dependencies and scripts
│ ├── src # Client-side source code
│ ├── tailwind.config.js # Tailwind CSS configuration
│ └── vite.config.js # Vite build configuration
├── server/ # Backend application (Node.js/Express API)
│ ├── .env.example # Example environment variables for the server
│ ├── nodemon.json # Nodemon configuration for development
│ ├── package-lock.json
│ ├── package.json # Backend dependencies and scripts
│ ├── server.js # Main entry point for the backend server
│ └── src # Backend source code (controllers, routes, models)
├── README.md # Project README file
├── package-lock.json # Root-level dependency lock file
└── package.json # Root-level project configuration
```

---

## ⚙️ Installation & Setup

To get PushDoc up and running on your local machine, follow these steps:

1. **Clone the Repository**
 ```bash
 git clone https://github.com/your-username/pushdoc.git
 cd pushdoc
 ```

2. **Install Backend Dependencies**
 Navigate to the `server` directory and install the necessary packages:
 ```bash
 cd server
 npm install
 cd .. # Go back to the root directory
 ```

3. **Install Frontend Dependencies**
 Navigate to the `client` directory and install the necessary packages:
 ```bash
 cd client
 npm install
 cd .. # Go back to the root directory
 ```

4. **Configure Environment Variables**
 Create a `.env` file in the `server/` directory by copying the example file:
 ```bash
 cp server/.env.example server/.env
 ```
 Then, open `server/.env` and fill in the required environment variables. Refer to the [Environment Variables](#-environment-variables) section for details.

---

## 🔐 Environment Variables

PushDoc requires the following environment variables to be set in your `server/.env` file:

| Variable | Required | Description |
| :--------------------------- | :------- | :------------------------------------------------------------- |
| `NODE_ENV` | Yes | Node.js environment (e.g., `development`, `production`) |
| `PORT` | Yes | Port for the backend server to listen on |
| `CORS_ORIGIN` | Yes | Origin URL allowed for CORS requests (e.g., `http://localhost:3000`) |
| `MONGODB_URI` | Yes | Connection URI for MongoDB database |
| `REDIS_HOST` | Yes | Hostname for the Redis server |
| `REDIS_PORT` | Yes | Port for the Redis server |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret |
| `GITHUB_REDIRECT_URI` | Yes | OAuth redirect URI for GitHub |
| `GITHUB_APP_ID` | Yes | GitHub App ID |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret token for GitHub webhooks |
| `JWT_SECRET` | Yes | Secret key for signing JSON Web Tokens |
| `GEMINI_API_KEY_1` | Yes | API key for Gemini AI model (Key 1) |
| `GEMINI_API_KEY_2` | Yes | API key for Gemini AI model (Key 2) |
| `GEMINI_API_KEY_3` | Yes | API key for Gemini AI model (Key 3) |
| `GROQ_API_KEY_1` | Yes | API key for Groq AI model (Key 1) |
| `GROQ_API_KEY_2` | Yes | API key for Groq AI model (Key 2) |
| `WORKSPACE_ROOT_PATH` | Yes | Path to a workspace directory for temporary files |

---

## 🌐 API Reference

The PushDoc API provides endpoints for GitHub authentication, app installation, repository management, job monitoring, and webhook handling.

### Router: `server/src/routes/auth.js`

| Method | Endpoint | Auth | Description |
| :----- | :------------------- | :--------- | :--------------------------------------------- |
| `GET` | `/auth/github/login` | No | Initiates GitHub OAuth login flow. |
| `GET` | `/auth/github/callback` | No | Handles GitHub OAuth callback and user login. |

### Router: `server/src/routes/github.js`

| Method | Endpoint | Auth | Description |
| :----- | :-------------------------------- | :--------- | :--------------------------------------------- |
| `GET` | `/github/app` | Yes | Retrieves information about the GitHub App. |
| `GET` | `/github/install` | Yes | Redirects to GitHub App installation page. |
| `GET` | `/github/install/callback` | No | Handles GitHub App installation callback. |
| `GET` | `/github/repositories/sync` | Yes | Syncs the user's GitHub repositories. |
| `GET` | `/github/jobs` | Yes | Retrieves a list of all README generation jobs.|
| `GET` | `/github/jobs/:jobId/logs` | Yes | Fetches logs for a specific job. |
| `POST` | `/github/repositories/:repoId/trigger` | Yes | Triggers a manual README generation for a repository.|
| `PATCH`| `/github/repositories/:repoId/toggle` | Yes | Toggles the active status of a repository for PushDoc.|

### Router: `server/src/routes/index.js`

| Method | Endpoint | Auth | Description |
| :----- | :------------------- | :--------- | :--------------------------------------------- |
| `GET` | `/` | No | Root endpoint, checks API and Redis status. |

### Router: `server/src/routes/webhook.js`

| Method | Endpoint | Auth | Description |
| :----- | :------------------- | :--------- | :--------------------------------------------- |
| `POST` | `/webhooks/github` | No | Receives and processes GitHub webhook events. |

---

## 🗄️ Database Models

PushDoc utilizes MongoDB to store and manage critical application data, including user information, GitHub installations, repositories, and README generation jobs.

| Model | Key Fields | Description |
| :---------------- | :--------------------------------------- | :---------------------------------------------- |
| **Installation** | `installationId`, `user`, `accountLogin` | Stores details of a GitHub App installation. |
| **InstallationState** | `state`, `user`, `expiresAt` | Manages temporary states during installation flows.|
| **Job** | `repository`, `bullJobId`, `commitSha`, `status` | Tracks the lifecycle and details of each README generation job.|
| **Repository** | `githubId`, `installation`, `fullName`, `isActive` | Stores information about a GitHub repository integrated with PushDoc.|
| **User** | `githubId`, `username`, `email` | Stores user profiles authenticated via GitHub. |

---