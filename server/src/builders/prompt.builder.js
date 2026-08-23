/**
 * Prompt Builder
 *
 * Builds the final generation prompt for the README. Accepts a pre-computed
 * `facts` object (from facts.extractor.js) as an optional second argument.
 * When provided, it injects a GROUNDING CONSTRAINT block that lists the exact
 * identifiers the model may reference — packages, routes, env vars, scripts.
 * This is the primary hallucination-prevention mechanism on the generation side
 * (the critic handles detection on the output side).
 */

/**
 * Builds a machine-readable grounding constraint block from the facts object.
 *
 * The block lists the exact identifiers that were extracted from static analysis.
 * The model is instructed that it may only reference identifiers from this list.
 * If the facts object is null or empty, returns an empty string so the prompt
 * degrades gracefully to the original behavior.
 *
 * @param {object|null} facts - Output of extractFacts()
 * @returns {string} Grounding constraint prompt block, or "" if facts is empty
 */
const buildGroundingConstraint = (facts) => {
    if (!facts) return "";

    const lines = [];

    // Only inject the block if there is at least one non-empty fact category.
    const hasPackages = (facts.dependencies?.length ?? 0) > 0;
    const hasRoutes   = (facts.routes?.length ?? 0) > 0;
    const hasEnvVars  = (facts.envFileVars?.length ?? 0) > 0;
    const hasScripts  = (facts.scripts?.length ?? 0) > 0;

    if (!hasPackages && !hasRoutes && !hasEnvVars && !hasScripts) return "";

    lines.push(`
========================
GROUNDING CONSTRAINT — CRITICAL
========================

The following identifiers were extracted from this repository's code by static
analysis. They are the ONLY values you may use when writing the README.
Do NOT invent, assume, or guess any identifier not on these lists.
If a list is empty, omit that section from the README entirely.
`);

    if (hasPackages) {
        lines.push(`CONFIRMED PACKAGES (from package.json — these are the ONLY packages you may mention):`);
        lines.push(facts.dependencies.join(", "));
        lines.push("");
    }

    if (hasRoutes) {
        lines.push(`CONFIRMED API ROUTES (from route files — these are the ONLY endpoints you may document):`);
        for (const r of facts.routes) {
            lines.push(`  ${r.method.padEnd(7)} ${r.path}`);
        }
        lines.push("");
    }

    if (hasEnvVars) {
        lines.push(`CONFIRMED ENV VARS (from .env.example — these are the ONLY variable names you may mention):`);
        lines.push(facts.envFileVars.join(", "));
        lines.push("");
    }

    if (hasScripts) {
        lines.push(`CONFIRMED SCRIPTS (from package.json — these are the ONLY scripts you may document):`);
        for (const s of facts.scripts) {
            lines.push(`  ${s.name.padEnd(14)} ${s.command}`);
        }
        lines.push("");
    }

    return lines.join("\n");
};

/**
 * @param {string} repositoryContext - Assembled context string from the context builder
 * @param {object|null} facts        - Output of extractFacts(); if null, the constraint
 *                                     block is omitted and the original behavior is preserved
 * @returns {string} Full generation prompt
 */
export const buildPrompt = (repositoryContext, facts = null) => {

    const groundingBlock = buildGroundingConstraint(facts);

    return `
You are a senior technical writer and open-source documentation expert.

Your task is to generate a PROFESSIONAL, CREATIVE, and VISUALLY RICH README.md for a GitHub repository.

========================
STEP 1 — UNDERSTAND THE PROJECT PURPOSE (READ THIS FIRST)
========================

Before writing anything, READ the entire REPOSITORY CONTEXT carefully and answer these questions:

1. What does this project actually DO for its end users? (not just what models it has)

2. CHECK THE PROJECT TYPE (first line of context):
   - **BACKEND**: Look at WORKER, PIPELINE, SERVICE, ROUTE, and MODEL file names.
     - e.g. "readme.worker.js" + "readme.pipeline.js" = this project generates READMEs automatically
   - **FRONTEND**: Look at COMPONENT and PAGE files to understand what UI screens exist.
     - e.g. "RestaurantList.jsx" = app displays restaurants
     - e.g. "axios.get('/api/restaurants')" in a component = app fetches restaurant data from an API
     - Read the actual JSX/TSX source carefully — the component names and data they render IS the feature list.
   - **FULLSTACK**: Look at both sides.

3. For FRONTEND projects specifically:
   - Read every file in RAW SOURCE CODE and identify what data is displayed (what the user sees)
   - Look for fetch/axios calls to understand what APIs are consumed
   - Look for component names like "RestaurantCard", "MovieList", "ProductGrid" — they reveal the domain
   - NEVER describe a frontend project as "a foundational React app" or "Vite boilerplate" — that describes the scaffolding, not the project

4. Look at SERVICE file names for domain actions (backend/fullstack):
   - git.service.js = Git operations
   - github.service.js = GitHub API integration
   - readme.service.js = README file handling
5. Look at COMPONENTS/PAGES to understand frontend features:
   - Dashboard.jsx = User dashboard
   - Login.jsx = Authentication
6. Look at the FOLDER STRUCTURE — what does the architecture reveal about the product?
7. Look at API ROUTES — what does the API actually expose to users?

Your opening description MUST capture the REAL purpose of the tool from a USER perspective:
- WRONG (backend): "An Express.js application for managing installations, jobs, and repositories"
- RIGHT (backend):  "PushDoc is a GitHub App that automatically generates and commits professional README.md files to your repositories using AI."
- WRONG (frontend): "A foundational React application bootstrapped with Vite for a modern development workflow."
- RIGHT (frontend):  "A React app that fetches live restaurant listings from the Swiggy API and displays them in a browsable card gallery."

========================
CRITICAL RULES
========================

1. Use ONLY the repository context provided below. Do NOT invent facts.

2. NEVER fabricate:
   - Environment variable names (only use exact keys from .env.example or .env.sample)
   - API endpoints (only use exact paths extracted from route files)
   - Folder/file names (only use what is listed in the context)
   - Features not explicitly found in code, workers, or pipeline names
   - Database fields not found in model definitions

3. If a section's data is missing from the context, OMIT that section entirely.

4. Do NOT add placeholders like [Your API Key] or [Description here].

5. Derive FEATURES from the ENTIRE system:
   - Workers/Pipelines (what automated jobs run?)
   - Services (what integrations exist?)
   - Routes (what does the API do end-to-end?)
   - Models (what data is tracked?)
   - Components/Pages (what does the user interface do? What are the main views?)
${groundingBlock}
========================
STYLE REQUIREMENTS — MANDATORY
========================

1. BADGES (top of file, after the title and description blockquote):
   - Use real shields.io badges ONLY for tech confirmed in package.json
   - OUTPUT ALL BADGES ON A SINGLE LINE separated by spaces. Do NOT use bullet points or newlines between badges.
   - Badge format: ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
   - Common badge URLs (use ONLY if tech found in context):
     - Node.js:    https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white
     - Express:    https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
     - MongoDB:    https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
     - React:      https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black
     - Redis:      https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white
     - JWT:        https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white
     - BullMQ:     https://img.shields.io/badge/BullMQ-D21C1C?style=for-the-badge&logo=redis&logoColor=white
     - GitHub App: https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white
     - Docker:     https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
     - TypeScript: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
     - Python:     https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
     - PostgreSQL: https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white

2. FOLDER STRUCTURE:
   - Use ONLY the folders/files listed in the FOLDER STRUCTURE section of the context
   - Render as a code block with tree characters (├── └── │)
   - Add short inline comments on each major folder describing its purpose
   - Example format:
     \`\`\`
     project-root/
     ├── src/
     │   ├── controllers/   # HTTP request handlers
     │   ├── services/      # Business logic & integrations
     │   ├── workers/       # Background job processors
     │   ├── pipelines/     # Automated workflows
     │   └── models/        # MongoDB schemas
     ├── client/            # React frontend
     └── package.json
     \`\`\`

3. ENVIRONMENT VARIABLES TABLE:
   - ONLY include variable names that appear verbatim in .env.example or .env.sample from context
   - Format: | Variable | Required | Description |
   - OMIT entirely if no .env.example found in context

4. API ENDPOINTS TABLE:
   - Only include routes from the API OVERVIEW section in context
   - Format: | Method | Endpoint | Auth | Description |
   - OMIT if no routes found

5. DATABASE MODELS TABLE:
   - Format: | Model | Key Fields | Description |
   - OMIT if no models found

6. TECH STACK TABLE:
   - Use a 3-column table: | Category | Technology | Purpose |
   - Only include technologies confirmed in TECH STACK section

7. VISUAL ELEMENTS:
   - Emoji section headers: ✨ Features, 🛠️ Tech Stack, 📁 Project Structure, ⚙️ Setup, 🔐 Env, 🌐 API, 🗄️ Models
   - Horizontal rules (---) between every major section

========================
README FORMAT (follow exactly in this order)
========================

# [Emoji] [Project Name]

> [ONE clear sentence describing WHAT THIS TOOL DOES for the user — derived from analyzing the full system, not just model names]

[BADGES ROW — shields.io only for confirmed tech]

---

## 📋 Table of Contents
(Generate a dynamic table of contents with links ONLY for the sections you actually include below. Do not include links for omitted sections.)

---

## ✨ Features
(Bullet list — each feature describes end-user value, derived from workers + services + routes + models)

---

## 🛠️ Tech Stack
(3-column table: Category | Technology | Purpose)

---

## 📁 Project Structure
(Tree code block from FOLDER STRUCTURE section only, with inline comments)

---

## ⚙️ Installation & Setup
(Step-by-step instructions derived from the context. If package.json exists, use its scripts. Otherwise, infer standard commands for the detected languages.)

---

## 🔐 Environment Variables
(Table — OMIT entirely if .env.example not in context)

---

## 🌐 API Reference
(Table — OMIT if no routes in context)

---

## 🗄️ Database Models
(Table — OMIT if no models in context)

---

## 📜 Available Scripts
(List available scripts from package.json, Makefiles, or task runners. OMIT entirely if none are found in the context.)

---

========================
REPOSITORY CONTEXT
========================

${repositoryContext}

`;
};