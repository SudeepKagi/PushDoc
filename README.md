🤖 PUSH_DOC is ready!

# 🚀 PushDoc

> PushDoc is a fullstack GitHub App that automates the generation and updating of `README.md` files in your repositories using advanced AI, streamlining your documentation workflow.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![GitHub App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white) 

---

## 📋 Table of Contents

* [✨ Features](#-features)
* [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
* [📁 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#%EF%B8%8F-installation--setup)
* [🔐 Environment Variables](#-environment-variables)
* [🌐 API Reference](#-api-reference)
* [🗄️ Database Models](#%EF%B8%8F-database-models)
* [📜 Available Scripts](#-available-scripts)

---

## ✨ Features

* **AI-Powered README Generation:** Automatically generate professional and context-rich `README.md` files for your repositories using integrated AI models (Gemini, Groq).
* **GitHub App Integration:** Seamlessly connect with your GitHub account, manage installations, and respond to repository events via webhooks.
* **Repository Management Dashboard:** A user-friendly web interface to sync, view, and manage your GitHub repositories.
* **Toggle README Automation:** Activate or deactivate automatic README generation for individual repositories with a simple switch.
* **Manual Generation Trigger:** Manually initiate the README generation process for any active repository at your command.
* **Real-time Job Monitoring:** Track the status and progress of all README generation jobs, from queuing to completion or failure, including detailed logs.
* **Secure GitHub Authentication:** Authenticate users and manage permissions securely through GitHub OAuth.
* **Webhook Event Handling:** Process GitHub events (like pushes or new installations) to trigger automated README updates.
* **Robust Job Queuing:** Utilizes a background job queue system (BullMQ) to handle README generation efficiently and reliably.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :---------------- | :------------- | :------------------------------------------------------ |
| **Backend** | Node.js | JavaScript runtime for server-side logic |
| **Backend** | Express.js | Web framework for building the RESTful API |
| **Database** | MongoDB | NoSQL database for storing user, repository, and job data |
| **Caching/Queue** | Redis | In-memory data store for job queueing and session management |
| **Job Queue** | BullMQ | Robust job queue for managing background README generation tasks |
| **AI APIs** | Gemini API | AI model for generating `README.md` content |
| **AI APIs** | Groq API | AI model for generating `README.md` content |
| **Authentication**| JWT | Secure token-based user authentication |
| **Frontend** | React | JavaScript library for building interactive user interfaces |
| **Frontend** | Vite | Fast build tool for a modern development experience |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid UI development |
| **Package Mgmt** | npm | Package manager for JavaScript dependencies |
| **Version Control**| Git | Distributed version control system |

---

## 📁 Project Structure

```
pushdoc/
├── client/ # React.js frontend application
│ ├── index.html # Main HTML entry point
│ ├── package-lock.json
│ ├── package.json # Frontend dependencies and scripts
│ ├── src # Frontend source code (components, utils, etc.)
│ ├── tailwind.config.js # Tailwind CSS configuration
│ └── vite.config.js # Vite build tool configuration
├── server/ # Node.js/Express.js backend application
│ ├── .env.example # Example environment variables for the backend
│ ├── nodemon.json # Configuration for nodemon development server
│ ├── package-lock.json
│ ├── package.json # Backend dependencies and scripts
│ ├── server.js # Main backend entry point
│ └── src # Backend source code
│ ├── app.js # Express application setup and middleware
│ ├── controllers/ # HTTP request handlers and business logic
│ ├── models/ # Mongoose schemas for MongoDB database
│ └── routes/ # API endpoint definitions and routing logic
├── README.md # Project README file
├── package-lock.json
└── package.json # Root project dependencies (if any)
```

---

## ⚙️ Installation & Setup

To get PushDoc up and running on your local machine, follow these steps:

1. **Clone the Repository:**
 ```bash
 git clone https://github.com/your-username/pushdoc.git
 cd pushdoc
 ```

2. **Install Dependencies:**

 * **Root Dependencies:**
 ```bash
 npm install
 ```
 * **Backend Dependencies:**
 ```bash
 cd server
 npm install
 cd ..
 ```
 * **Frontend Dependencies:**
 ```bash
 cd client
 npm install
 cd ..
 ```

3. **Configure Environment Variables:**

 * Navigate to the `server/` directory and create a `.env` file by copying the example:
 ```bash
 cp server/.env.example server/.env
 ```
 * Fill in the necessary values in `server/.env`. Refer to the [Environment Variables](#-environment-variables) section for details.
 * Ensure your `FRONTEND_URL` and `BACKEND_URL` are correctly set for inter-application communication.

4. **Start the Backend Server:**
 ```bash
 cd server
 node server.js
 # Or if using a start script: npm start
 cd ..
 ```

5. **Start the Frontend Development Server:**
 ```bash
 cd client
 npm run dev
 cd ..
 ```
 The frontend application should now be accessible, typically at `http://localhost:5173`.

---

## 🔐 Environment Variables

PushDoc requires the following environment variables for both the backend and frontend (via `BACKEND_URL` in the frontend). These should be defined in `server/.env`.

| Variable | Required | Description |
| :---------------------------- | :------- | :------------------------------------------------------------- |
| `NODE_ENV` | No | Node.js environment (e.g., `development`, `production`). |
| `PORT` | No | Port for the backend server to listen on (default: `3000`). |
| `CORS_ORIGIN` | Yes | URL of the frontend application for CORS. |
| `MONGODB_URI` | Yes | Connection string for your MongoDB database. |
| `REDIS_HOST` | Yes | Hostname for your Redis instance. |
| `REDIS_PORT` | Yes | Port for your Redis instance. |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID. |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret. |
| `GITHUB_REDIRECT_URI` | Yes | Redirect URI configured for your GitHub OAuth App. |
| `GITHUB_APP_ID` | Yes | Your GitHub App ID. |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App. |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret for verifying GitHub webhook payloads. |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JWTs. |
| `GEMINI_API_KEY_1` | Yes | API key for Gemini AI service (for README generation). |
| `GEMINI_API_KEY_2` | Yes | Secondary API key for Gemini AI service. |
| `GEMINI_API_KEY_3` | Yes | Tertiary API key for Gemini AI service. |
| `GROQ_API_KEY_1` | Yes | API key for Groq AI service (for README generation). |
| `GROQ_API_KEY_2` | Yes | Secondary API key for Groq AI service. |
| `WORKSPACE_ROOT_PATH` | No | Root path for temporary workspace directories. |

---

## 🌐 API Reference

The PushDoc backend provides a comprehensive API to manage GitHub integrations, user authentication, and README generation jobs. All authenticated routes require a valid JWT.

| Method | Endpoint | Auth | Description |
| :----- | :---------------------------- | :--- | :--------------------------------------------------------- |
| `GET` | `/github/login` | No | Initiates the GitHub OAuth login flow. |
| `GET` | `/github/callback` | No | Handles the callback from GitHub OAuth after user authentication. |
| `GET` | `/app` | Yes | Retrieves details about the installed GitHub App. |
| `GET` | `/install` | Yes | Redirects to GitHub for installing or configuring the GitHub App. |
| `GET` | `/install/callback` | No | Handles the callback after a GitHub App installation. |
| `GET` | `/repositories/sync` | Yes | Synchronizes the user's GitHub repositories with the application database. |
| `GET` | `/jobs` | Yes | Fetches a list of all README generation jobs for the authenticated user. |
| `GET` | `/jobs/:jobId/logs` | Yes | Retrieves the detailed logs for a specific README generation job. |
| `POST` | `/repositories/:repoId/trigger` | Yes | Manually triggers a new README generation job for the specified repository. |
| `PATCH`| `/repositories/:repoId/toggle`| Yes | Activates or deactivates PushDoc's README generation for a specific repository. |
| `GET` | `/` | No | Provides a basic health check for the API and Redis connection status. |
| `POST` | `/github` | No | Endpoint for receiving and processing GitHub webhook events (e.g., `push`, `installation`). |

---

## 🗄️ Database Models

PushDoc utilizes MongoDB to persist critical application data. Here's an overview of the main models:

| Model | Key Fields | Description |
| :-------------- | :--------------------- | :------------------------------------------------------------ |
| **Installation** | `installationId`, `user` | Stores details about a GitHub App installation for a user or organization. |
| **InstallationState** | `state`, `user` | Temporarily holds state during the GitHub App installation process. |
| **Job** | `repository`, `bullJobId`, `commitSha`, `status` | Tracks the lifecycle and results of each README generation job. |
| **Repository** | `githubId`, `installation`, `name`, `isActive` | Manages information about GitHub repositories integrated with PushDoc. |
| **User** | `githubId`, `username`, `email`, `githubAccessToken` | Stores user profiles, primarily authenticated via GitHub. |

---

## 📜 Available Scripts

This project uses standard npm commands for development and execution.

* **Backend (in `server/` directory):**
 * `node server.js`: Starts the backend server.
 * You might find additional scripts like `npm start` or `npm run dev` if defined in `server/package.json`.

* **Frontend (in `client/` directory):**
 * `npm run dev`: Starts the Vite development server for the frontend.
 * `npm run build`: Builds the frontend for production deployment.

* **Root:**
 * `npm install`: Installs dependencies for the entire monorepo structure.