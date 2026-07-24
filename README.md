📄🤖 PushDoc

> PushDoc is a fullstack GitHub App that automates the generation and updates of professional `README.md` files for your repositories, providing a streamlined workflow for documentation and project presentation.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📋 Table of Contents
* [✨ Features](#-features)
* [🛠️ Tech Stack](#-tech-stack)
* [📁 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#%EF%B8%8F-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🌐 API Reference](#-api-reference)
* [🗄️ Database Models](#%EF%B8%8F-database-models)

---

## ✨ Features
* **GitHub App Integration**: Seamlessly integrate with your GitHub account, manage installations, and receive real-time repository events via webhooks.
* **User Authentication**: Secure user login and authorization using GitHub OAuth, protecting access to your repository data.
* **Repository Management**: Sync, view, activate, and deactivate specific GitHub repositories for README generation directly from a user-friendly interface.
* **Automated README Generation**: Trigger the creation and update of `README.md` files automatically via GitHub webhooks (e.g., on push) or manually on demand.
* **AI-Powered Documentation**: Leverages advanced AI models (Gemini, Groq) to intelligently generate comprehensive and professional `README.md` content.
* **Job Tracking & Logging**: Monitor the progress of each README generation job, from cloning to committing, and view detailed logs to troubleshoot any issues.
* **Persistent Data Storage**: Robust storage for user profiles, GitHub installations, repository details, and job history.

---

## 🛠️ Tech Stack
| Category | Technology | Purpose |
| :--------------- | :------------------------- | :------------------------------------------ |
| **Backend** | Node.js, Express.js | Server-side logic, API handling, GitHub Webhook processing |
| **Frontend** | React, Vite | Interactive user interface for managing repositories and jobs |
| **Database** | MongoDB | Persistent storage for installations, repositories, jobs, and users |
| **Caching/Queue**| Redis | Job queue management and temporary state storage |
| **Authentication**| JWT | Secure API authentication for user sessions |
| **VCS Integration**| GitHub App API | Integration with GitHub for repository access and event handling |
| **AI Integration**| Gemini API, Groq API | AI-powered content generation for `README.md` files |
| **Package Manager**| npm | Project dependency management |

---

## 📁 Project Structure
```
project-root/
├── client/ # Frontend application (React with Vite)
│ ├── index.html # Main HTML entry point
│ ├── package-lock.json
│ ├── package.json # Frontend dependencies
│ ├── src # Frontend source code
│ ├── tailwind.config.js # Tailwind CSS configuration
│ └── vite.config.js # Vite build configuration
├── server/ # Backend application (Node.js/Express)
│ ├── .env.example # Example environment variables
│ ├── nodemon.json # Nodemon configuration for development
│ ├── package-lock.json
│ ├── package.json # Backend dependencies
│ ├── server.js # Main server entry point
│ └── src # Backend source code (routes, controllers, models)
├── README.md # Project README file
├── package-lock.json # Root package lock file
└── package.json # Root package dependencies/scripts
```

---

## ⚙️ Installation & Setup

Follow these steps to get PushDoc up and running on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pushdoc.git # Replace with actual repo URL
cd pushdoc
```

### 2. Configure and Start the Backend
Navigate to the `server` directory, set up your environment variables, and install dependencies.

```bash
cd server
cp .env.example .env
# Open the .env file and fill in your GitHub App credentials, API keys, and database/Redis connection strings.
# See the "Environment Variables" section for details.
npm install
npm start # Or `npm run dev` for development with nodemon
```

### 3. Configure and Start the Frontend
Navigate to the `client` directory, install dependencies, and start the development server.

```bash
cd ../client
npm install
npm run dev
```
The frontend application will typically run on `http://localhost:5173` (default for Vite) and proxy API requests to your backend.

---

## 🔐 Environment Variables
A `.env.example` file is provided in the `server/` directory. Copy it to `.env` and populate the variables with your specific configurations.

| Variable | Required | Description |
| :------------------------ | :------- | :------------------------------------------------------------- |
| `NODE_ENV` | Yes | Application environment (e.g., `development`, `production`) |
| `PORT` | Yes | Port for the backend server to listen on |
| `CORS_ORIGIN` | Yes | Origin allowed for Cross-Origin Resource Sharing (e.g., frontend URL) |
| `MONGODB_URI` | Yes | Connection string for your MongoDB database |
| `REDIS_HOST` | Yes | Hostname for your Redis instance |
| `REDIS_PORT` | Yes | Port for your Redis instance |
| `GITHUB_CLIENT_ID` | Yes | OAuth Client ID for your GitHub App |
| `GITHUB_CLIENT_SECRET` | Yes | OAuth Client Secret for your GitHub App |
| `GITHUB_REDIRECT_URI` | Yes | Redirect URI for GitHub OAuth callback |
| `GITHUB_APP_ID` | Yes | Numeric ID of your GitHub App |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret token for validating GitHub webhook payloads |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JWTs |
| `GEMINI_API_KEY_1` | Yes | API Key for Gemini model (primary) |
| `GEMINI_API_KEY_2` | Yes | API Key for Gemini model (secondary, for redundancy/load balancing) |
| `GEMINI_API_KEY_3` | Yes | API Key for Gemini model (tertiary) |
| `GROQ_API_KEY_1` | Yes | API Key for Groq model (primary) |
| `GROQ_API_KEY_2` | Yes | API Key for Groq model (secondary) |
| `WORKSPACE_ROOT_PATH` | Yes | Path for temporary workspace files (e.g., repository clones) |

---

## 🌐 API Reference
The backend exposes the following API endpoints:

| Method | Endpoint | Auth | Description |
| :----- | :----------------------------- | :--- | :----------------------------------------------------------- |
| `GET` | `/` | No | Checks API health and Redis status. |
| `GET` | `/auth/github/login` | No | Initiates GitHub OAuth login flow. |
| `GET` | `/auth/github/callback` | No | Handles GitHub OAuth callback and user authentication. |
| `GET` | `/github/app` | Yes | Retrieves information about the installed GitHub App. |
| `GET` | `/github/install` | Yes | Redirects to the GitHub App installation page. |
| `GET` | `/github/install/callback` | No | Handles callback after GitHub App installation. |
| `GET` | `/github/repositories/sync` | Yes | Synchronizes user's GitHub repositories with the database. |
| `GET` | `/github/jobs` | Yes | Retrieves a list of all README generation jobs. |
| `GET` | `/github/jobs/:jobId/logs` | Yes | Fetches logs for a specific README generation job. |
| `POST` | `/github/repositories/:repoId/trigger` | Yes | Triggers a manual README generation for a specific repository. |
| `PATCH`| `/github/repositories/:repoId/toggle` | Yes | Toggles the active status of a repository for automated processing. |
| `POST` | `/webhooks/github` | No | Endpoint for receiving and processing GitHub webhook events. |

---

## 🗄️ Database Models
PushDoc uses MongoDB to store essential application data.

| Model | Key Fields | Description |
| :---------------- | :------------------------------------------ | :----------------------------------------------------------- |
| `Installation` | `installationId`, `user`, `accountLogin` | Tracks active GitHub App installations by users/organizations. |
| `InstallationState` | `state`, `user`, `expiresAt` | Manages temporary states during the GitHub App installation and OAuth flows. |
| `Job` | `repository`, `bullJobId`, `commitSha`, `status` | Records each instance of a README generation task, including status, logs, and generated content. |
| `Repository` | `githubId`, `installation`, `name`, `owner` | Stores details of GitHub repositories that are managed by PushDoc. |
| `User` | `githubId`, `username`, `githubAccessToken` | User profiles authenticated via GitHub, storing essential identity and access tokens. |

---