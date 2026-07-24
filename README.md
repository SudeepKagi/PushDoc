# 📄 PushDoc

> PushDoc is a sophisticated GitHub App designed to revolutionize repository documentation by autonomously generating and updating professional `README.md` files using advanced AI. It integrates directly with your GitHub repositories, providing a streamlined workflow for maintaining high-quality, consistent project documentation.

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
* [📜 Available Scripts](#-available-scripts)

---

## ✨ Features

* **AI-Powered `README.md` Generation:** Automatically generate comprehensive and well-structured `README.md` files for your GitHub repositories using integrated AI models (implied by Gemini and Groq API keys).
* **Effortless GitHub Integration:** Seamlessly connect PushDoc as a GitHub App to manage installations and securely access your repositories.
* **Repository Synchronization & Control:** Synchronize your GitHub repositories, activate/deactivate documentation generation for specific projects, and manually trigger updates via a user-friendly interface.
* **Real-time Job Monitoring:** Track the status of README generation jobs—from queuing and cloning to AI generation, committing, and pushing—with detailed logs, providing full transparency into the process.
* **Automated Webhook Processing:** React to GitHub events (e.g., pushes) to automatically trigger documentation updates, keeping your `README.md` files always current.
* **Secure User Authentication:** Authenticate securely using GitHub OAuth, managing user profiles and access tokens for a personalized experience.
* **Installation & Repository Management:** Maintain a clear overview of your GitHub App installations and associated repositories through a dedicated management system.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :------------------ | :--------------- | :-------------------------------------------- |
| **Backend** | Node.js | JavaScript runtime for server-side logic |
| | Express.js | Web framework for building RESTful APIs |
| **Frontend** | React | JavaScript library for building user interfaces |
| **Database** | MongoDB | NoSQL database for storing application data |
| **Caching/Queueing**| Redis | In-memory data store for caching and job queues |
| **Authentication** | JWT | JSON Web Tokens for secure session management |
| | GitHub OAuth | User authentication and authorization |
| **AI Integration** | Google Gemini, Groq| Language Model Integration for Content Generation |
| **Platform** | GitHub App | Integration with GitHub for repository access and webhooks |

---

## 📁 Project Structure

```
.
├── client/ # React frontend application
│ ├── package-lock.json
│ ├── package.json
│ └── src # Frontend source code
├── server/ # Node.js/Express backend application
│ ├── .env.example # Example environment variables for the server
│ ├── nodemon.json # Configuration for Nodemon development server
│ ├── package-lock.json
│ ├── package.json
│ └── src # Backend source code (controllers, routes, models)
├── README.md # Project README file
├── package-lock.json
└── package.json
```

---

## ⚙️ Installation & Setup

To get PushDoc up and running, follow these steps:

1. **Clone the repository:**
 ```bash
 git clone https://github.com/your-org/pushdoc.git
 cd pushdoc
 ```

2. **Set up the Backend:**
 Navigate to the `server` directory, install dependencies, and create your environment file.
 ```bash
 cd server
 npm install
 cp .env.example .env
 ```
 Edit the `.env` file with your specific configurations (see Environment Variables section).

3. **Set up the Frontend:**
 Navigate to the `client` directory and install dependencies.
 ```bash
 cd ../client
 npm install
 ```
 The frontend expects `BACKEND_URL` to be configured in its environment (e.g., in a `.env` file or directly in the build process if using Vite/CRA, though not explicitly shown in context, it's inferred from client API calls).

4. **Start the Backend Server:**
 From the `server` directory:
 ```bash
 npm run dev
 # Or, if 'dev' script is not defined, you might use:
 # nodemon server.js
 # or
 # node server.js
 ```
 The server will typically run on the port specified in your `.env` (default is likely 5000 or 3000).

5. **Start the Frontend Application:**
 From the `client` directory:
 ```bash
 npm run dev
 # Or, if 'dev' script is not defined, you might use:
 # npm start
 ```
 The client application will typically open in your browser at `http://localhost:5173` (common for Vite) or `http://localhost:3000`.

---

## 🔐 Environment Variables

Before running the application, create a `.env` file in the `server/` directory based on `server/.env.example` and populate it with the required values.

| Variable | Required | Description |
| :------------------------ | :------- | :------------------------------------------------------------------ |
| `NODE_ENV` | Yes | Environment mode (e.g., `development`, `production`) |
| `PORT` | Yes | Port for the backend server to listen on |
| `CORS_ORIGIN` | Yes | Origin URL allowed for CORS requests (e.g., your frontend URL) |
| `MONGODB_URI` | Yes | Connection URI for your MongoDB database |
| `REDIS_HOST` | Yes | Hostname for the Redis server |
| `REDIS_PORT` | Yes | Port for the Redis server |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App Client Secret |
| `GITHUB_REDIRECT_URI` | Yes | Callback URL after GitHub OAuth authentication |
| `GITHUB_APP_ID` | Yes | Your GitHub App's ID |
| `GITHUB_APP_NAME` | Yes | Name of your GitHub App |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret token for validating GitHub webhooks |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JSON Web Tokens |
| `GEMINI_API_KEY_1` | No | API Key for Google Gemini (AI generation) |
| `GEMINI_API_KEY_2` | No | Secondary API Key for Google Gemini |
| `GEMINI_API_KEY_3` | No | Tertiary API Key for Google Gemini |
| `GROQ_API_KEY_1` | No | API Key for Groq (AI generation) |
| `GROQ_API_KEY_2` | No | Secondary API Key for Groq |
| `WORKSPACE_ROOT_PATH` | No | Root path for temporary workspace directories (if applicable) |

---

## 🌐 API Reference

The PushDoc backend exposes the following API endpoints:

| Method | Endpoint | Auth | Description |
| :----- | :-------------------------- | :------ | :-------------------------------------------------------------- |
| `GET` | `/` | No | Health check endpoint, returns API status and Redis connection. |
| `GET` | `/auth/github/login` | No | Initiates GitHub OAuth login flow. |
| `GET` | `/auth/github/callback` | No | Callback URL for GitHub OAuth after user authentication. |
| `GET` | `/github/app` | Required| Retrieves details about the installed GitHub App. |
| `GET` | `/github/install` | Required| Initiates GitHub App installation flow. |
| `GET` | `/github/install/callback` | No | Callback URL after GitHub App installation. |
| `GET` | `/github/repositories/sync` | Required| Syncs the user's GitHub repositories with the PushDoc system. |
| `GET` | `/github/jobs` | Required| Retrieves a list of all documentation generation jobs. |
| `GET` | `/github/jobs/:jobId/logs` | Required| Retrieves detailed logs for a specific job. |
| `POST` | `/github/repositories/:repoId/trigger`| Required| Manually triggers a README generation job for a repository. |
| `PATCH`| `/github/repositories/:repoId/toggle` | Required| Toggles the active status of a repository for auto-generation. |
| `POST` | `/webhooks/github` | No | Receives and processes GitHub webhook events. |

---

## 🗄️ Database Models

PushDoc uses MongoDB to store and manage various entities:

| Model | Key Fields | Description |
| :---------------- | :-------------------------------------------- | :------------------------------------------------------------------- |
| **Installation** | `installationId`, `user`, `accountLogin` | Represents a GitHub App installation on a user's account or organization. |
| **InstallationState**| `state`, `user`, `expiresAt` | Stores temporary state during the GitHub App installation process. |
| **Job** | `repository`, `bullJobId`, `commitSha`, `status`| Tracks the lifecycle and status of a README generation task. |
| **Repository** | `githubId`, `installation`, `fullName`, `isActive`| Stores details about a GitHub repository integrated with PushDoc. |
| **User** | `githubId`, `username`, `email`, `githubAccessToken`| Stores user profile information and GitHub authentication details. |

---

## 📜 Available Scripts

The project includes standard scripts for development and building.

**Server (`server/` directory):**

* `npm install`: Installs all backend dependencies.
* `npm run dev` (Inferred): Starts the Node.js server using Nodemon for automatic restarts during development.
* `node server.js` (Inferred): Starts the production Node.js server.

**Client (`client/` directory):**

* `npm install`: Installs all frontend dependencies.
* `npm run dev` (Inferred): Starts the development server for the React frontend, typically with hot-reloading.
* `npm run build` (Inferred): Creates a production-ready build of the React application.