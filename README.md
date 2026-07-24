🤖 PushDoc

> PushDoc is a powerful GitHub App that automates the generation, intelligent updating, and committing of professional README.md files to your repositories, leveraging AI for content creation and a robust job management system.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📋 Table of Contents

* [✨ Features](#-features)
* [🛠️ Tech Stack](#️-tech-stack)
* [📁 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#️-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🌐 API Reference](#-api-reference)
* [🗄️ Database Models](#-database-models)

---

## ✨ Features

* **GitHub App Integration**: Seamlessly authenticate and integrate with your GitHub account and repositories via the PushDoc GitHub App.
* **AI-Powered README Generation**: Leverages advanced AI models (Gemini, Groq) to generate high-quality, professional `README.md` files based on repository content and project context.
* **Automated README Updates**: Automatically triggers README generation and commit processes on relevant repository events (e.g., pushes, new installations) via webhooks.
* **Manual Generation & Toggle**: Users can manually trigger README generation for specific repositories and activate/deactivate PushDoc's services for individual repos.
* **Repository Synchronization**: Syncs and manages your GitHub repositories, allowing you to view and control which ones are enabled for PushDoc services.
* **Job Tracking & Logging**: Monitors the entire lifecycle of README generation jobs—from queuing and cloning to AI processing, writing, committing, and pushing—providing detailed status and logs.
* **User & Installation Management**: Securely manages user profiles and GitHub App installations, ensuring proper authorization and data handling.
* **Robust Backend API**: Provides a comprehensive API for interacting with installations, repositories, and job queues, supporting the frontend interface.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--------------- | :------------ | :--------------------------------------------------- |
| Language | JavaScript | Primary programming language for the entire project |
| Runtime | Node.js | Server-side JavaScript execution environment |
| Web Framework | Express | Robust web application framework for the API |
| Database | MongoDB | NoSQL database for storing application data |
| Queue/Caching | Redis | In-memory data store for caching and job queues |
| Authentication | JWT | Secure token-based authentication for API access |
| Authentication | GitHub OAuth | User authentication and authorization via GitHub |
| AI Integration | Gemini API | Integration with Google's AI models for content gen. |
| AI Integration | Groq API | Integration with Groq's AI models for content gen. |
| Package Manager | npm | Manages project dependencies and scripts |

---

## 📁 Project Structure

```
project-root/
├── client/ # Frontend application (likely React with Vite)
│ ├── index.html
│ ├── package-lock.json
│ ├── package.json
│ ├── src # Frontend source code
│ ├── tailwind.config.js
│ └── vite.config.js
├── server/ # Backend API server
│ ├── .env.example # Example environment variables for the server
│ ├── nodemon.json
│ ├── package-lock.json
│ ├── package.json
│ ├── server.js # Main server entry point
│ └── src # Backend source code (controllers, routes, models)
├── README.md # This README file
├── package-lock.json
└── package.json
```

---

## ⚙️ Installation & Setup

To get PushDoc up and running on your local machine, follow these steps:

1. **Clone the Repository:**
 ```bash
 git clone https://github.com/your-username/pushdoc.git
 cd pushdoc
 ```

2. **Server Setup:**
 Navigate into the `server` directory, install dependencies, and set up environment variables.

 ```bash
 cd server
 npm install
 cp .env.example .env
 ```
 Edit the `.env` file with your actual environment variable values (see [🔐 Environment Variables](#-environment-variables) section).

3. **Client Setup:**
 Open a new terminal, navigate into the `client` directory, and install dependencies.

 ```bash
 cd ../client
 npm install
 ```
 Ensure your `client/.env` (or similar for Vite) points to your backend URL if necessary.

4. **Run the Applications:**
 Start the backend server:
 ```bash
 cd ../server
 npm start # or node server.js
 ```
 Start the frontend client (in a separate terminal):
 ```bash
 cd ../client
 npm run dev # common for Vite apps
 ```

---

## 🔐 Environment Variables

PushDoc requires the following environment variables to be configured. Create a `.env` file in the `server/` directory based on `server/.env.example`.

| Variable | Required | Description |
| :---------------------------- | :------- | :---------------------------------------------------------------------------- |
| `NODE_ENV` | Yes | Node.js environment (e.g., `development`, `production`) |
| `PORT` | Yes | Port on which the Express server will run (e.g., `3000`) |
| `CORS_ORIGIN` | Yes | Comma-separated list of allowed origins for CORS (e.g., `http://localhost:5173`) |
| `MONGODB_URI` | Yes | Connection URI for your MongoDB database |
| `REDIS_HOST` | Yes | Hostname for the Redis server |
| `REDIS_PORT` | Yes | Port for the Redis server |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret |
| `GITHUB_REDIRECT_URI` | Yes | Redirect URI for GitHub OAuth callbacks |
| `GITHUB_APP_ID` | Yes | GitHub App ID |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret token for validating GitHub webhook payloads |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JSON Web Tokens |
| `GEMINI_API_KEY_1` | Yes | API Key for Gemini AI model |
| `GEMINI_API_KEY_2` | Yes | Alternate API Key for Gemini AI model (for redundancy/rate limits) |
| `GEMINI_API_KEY_3` | Yes | Third API Key for Gemini AI model (for redundancy/rate limits) |
| `GROQ_API_KEY_1` | Yes | API Key for Groq AI model |
| `GROQ_API_KEY_2` | Yes | Alternate API Key for Groq AI model (for redundancy/rate limits) |
| `WORKSPACE_ROOT_PATH` | Yes | Path where temporary repository clones/files will be stored |

---

## 🌐 API Reference

The PushDoc API provides endpoints for authentication, GitHub integration, repository management, and job monitoring.

| Method | Endpoint | Auth | Description |
| :----- | :----------------------------- | :--- | :------------------------------------------------------------------------ |
| `GET` | `/github/login` | No | Initiates the GitHub OAuth login process. |
| `GET` | `/github/callback` | No | Handles the callback after GitHub OAuth login, creates/logs in user. |
| `GET` | `/app` | Yes | Retrieves information about the connected GitHub App. |
| `GET` | `/install` | Yes | Redirects to GitHub for installing the App on new repositories. |
| `GET` | `/install/callback` | No | Handles the callback after GitHub App installation. |
| `GET` | `/repositories/sync` | Yes | Synchronizes user's GitHub repositories with the PushDoc database. |
| `GET` | `/jobs` | Yes | Retrieves a list of all README generation jobs. |
| `GET` | `/jobs/:jobId/logs` | Yes | Fetches detailed logs for a specific README generation job. |
| `POST` | `/repositories/:repoId/trigger`| Yes | Manually triggers a new README generation job for a specified repository. |
| `PATCH`| `/repositories/:repoId/toggle` | Yes | Toggles the active status of PushDoc for a specific repository. |
| `GET` | `/` | No | Returns a status message indicating the API is running. |
| `POST` | `/github` | No | Receives and processes GitHub webhook events. |

---

## 🗄️ Database Models

PushDoc uses several MongoDB models to manage users, installations, repositories, and README generation jobs.

| Model | Key Fields | Description |
| :-------------- | :--------------------- | :------------------------------------------------------------ |
| `Installation` | `installationId`, `user` | Stores details about GitHub App installations by users. |
| `InstallationState` | `state`, `user`, `expiresAt` | Temporarily stores state for GitHub App installation redirects. |
| `Job` | `repository`, `bullJobId`, `commitSha`, `status` | Tracks the progress and results of each README generation job. |
| `Repository` | `githubId`, `installation`, `name`, `owner`, `isActive` | Manages information and active status of integrated GitHub repositories. |
| `User` | `githubId`, `username`, `githubAccessToken` | Stores user profiles and GitHub authentication tokens. |

---