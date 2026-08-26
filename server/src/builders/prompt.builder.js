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

    const hasFeatures = (facts.features?.length ?? 0) > 0;
    if (hasFeatures) {
        lines.push(`CONFIRMED CORE CAPABILITIES (ensure your Features section documents these capabilities):`);
        for (const f of facts.features) {
            lines.push(`- **${f.title}**: ${f.description || ""}`);
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
You are a Principal Technical Writer, Open-Source Lead, and Software Architect.

Your task is to generate a WORLD-CLASS, HIGH-IMPACT, BEAUTIFULLY FORMATTED README.md for this GitHub repository. The README should match the standard of premier open-source projects (like Next.js, Supabase, Prisma, and Tailwind CSS) — visually stunning, technically rigorous, deeply informative, and immediate to understand.

========================
STEP 1 — UNDERSTAND THE SYSTEM & PURPOSE
========================

Read the entire REPOSITORY CONTEXT carefully before drafting:
1. What core problem does this project solve for engineers or end-users?
2. What are the key architectural pillars? (e.g. AST parsing, BullMQ/Redis worker pipelines, hybrid cookie+bearer auth, SSE streaming, circuit breakers, AI inference)
3. For FULLSTACK / BACKEND projects: Trace the end-to-end request/event lifecycle from ingress (webhooks/API routes) to workers to storage to UI.
4. For FRONTEND projects: Analyze component hierarchies, user flows, and state management.

Craft an opening tagline and executive description that captures the true value proposition and architectural sophistication.
- NEVER write: "An Express.js application for managing jobs" or "A React boilerplate".
- ALWAYS write: "PushDoc is an autonomous GitHub App and developer platform that synthesizes production-grade, AST-verified documentation for your codebases using multi-model AI orchestration."

========================
CRITICAL GROUNDING RULES
========================

1. Use ONLY the repository context provided below. Do NOT invent facts.
2. NEVER fabricate:
   - Environment variable names (use ONLY verified keys from .env.example / context)
   - API endpoints (use ONLY verified paths extracted from route files)
   - Folder/file names (use ONLY files that appear in the context)
   - Database fields (use ONLY confirmed fields from model schemas)
3. If a section's data is missing from the context, omit that section cleanly.
4. Do NOT use placeholders like "[Insert URL here]" or "[TODO]".
${groundingBlock}
========================
STYLE & FORMATTING REQUIREMENTS — MANDATORY
========================

1. TITLE & HERO BANNER:
   - Level 1 heading with an appropriate high-tech emoji (e.g. # 🚀 [Project Name] or # ⚡ [Project Name]).
   - A bold, punchy blockquote hook summarizing the project's mission:
     > **[Bold Catchy One-liner]** — [2-sentence comprehensive executive summary describing the problem it solves and key technical pillars].
   - SHIELDS.IO BADGES:
     Generate a clean row of badges for all confirmed primary frameworks, runtime, database, cache, queues, and AI providers.
     Format: \`![Label](https://img.shields.io/badge/Label-Color?style=for-the-badge&logo=LogoName&logoColor=white)\`
     Output all badges together on 1-2 clean lines separated by spaces.
     Reference badges:
     - Node.js:      ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
     - Express:      ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
     - React:        ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
     - Vite:         ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
     - Tailwind CSS: ![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
     - TypeScript:   ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
     - JavaScript:   ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
     - MongoDB:      ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
     - Redis:        ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
     - BullMQ:       ![BullMQ](https://img.shields.io/badge/BullMQ-D21C1C?style=for-the-badge&logo=redis&logoColor=white)
     - Google Gemini:![Google_Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
     - Groq:         ![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=fastapi&logoColor=white)
     - GitHub App:   ![GitHub_App](https://img.shields.io/badge/GitHub_App-181717?style=for-the-badge&logo=github&logoColor=white)
     - JWT:          ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
     - Docker:       ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

2. TABLE OF CONTENTS:
   - Use STRICTLY relative anchor links matching GitHub heading anchors (e.g. \`[✨ Features](#-features)\`, \`[🛠️ Tech Stack](#️-tech-stack)\`, \`[🏛️ System Architecture](#️-system-architecture)\`, \`[📁 Project Structure](#-project-structure)\`).
   - NEVER prefix with full repository URLs like https://github.com/...

3. HIGH-IMPACT FEATURES:
   - Write 5 to 8 comprehensive feature cards. Each feature must have:
     - A bold emoji title representing a major capability.
     - A 2-sentence explanation detailing the underlying technical mechanism (referencing actual workers, services, or AST parsers) and the concrete benefit to the user.
     - Document all core capabilities discovered in the codebase (e.g. AST analysis, background queues, AI fallback, live logs, security/sanitization, webhook automation).

4. TECH STACK TABLE:
   - 3-column markdown table:
     | Category | Technology | Purpose & Role in Codebase |
   - Group by Frontend/UI, Backend/API, Persistence & Caching, Task Queue & Background Jobs, AI & Inference, Authentication & Security, Tooling & DevOps.

5. SYSTEM ARCHITECTURE:
   - Include the section header \`## 🏛️ System Architecture\`.
   - Write a 2-3 sentence overview explaining the high-level architecture, event lifecycle, and data flow. (The automated Mermaid diagram will seamlessly pair with this overview).

6. PROJECT STRUCTURE:
   - Render in a clean ASCII tree format inside a code fence (\`\`\`...\`\`\`).
   - Include meaningful inline comments explaining the purpose of each major module/directory.
   - NEVER collapse multiple directories or files onto a single line.

7. INSTALLATION & SETUP:
   - Numbered step-by-step instructions:
     1. **Prerequisites** (Node.js, Redis, MongoDB, Git).
     2. **Clone & Install Dependencies** (Provide multiline bash code blocks with clean newlines — NEVER combine commands on one line).
     3. **Environment Setup** (Instructions to copy \`.env.example\` to \`.env\`).
     4. **Running Locally** (Show exact development commands).
     5. **Production Build** (Show build commands).

8. ENVIRONMENT VARIABLES:
   - Clean 4-column markdown table:
     | Variable | Description | Example / Default | Required |
   - Wrap variable names in backticks (\`PORT\`, \`MONGODB_URI\`).

9. API REFERENCE:
   - Clean 4-column markdown table:
     | Method | Endpoint | Description | Auth Required |
   - Wrap HTTP methods and paths in backticks (\`GET\`, \`/api/jobs\`).

10. DATABASE MODELS:
    - Clean 3-column markdown table:
      | Model | Key Fields | Purpose & System Relationships |

11. AVAILABLE SCRIPTS:
    - Clear bulleted list or table mapping every package script to its description.

========================
README OUTLINE (follow this exact order)
========================

# [Emoji] [Project Name]

> **[One-line hook]** — [2-sentence value proposition].

[Badges Row]

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
(5-8 detailed technical feature cards with bold emoji titles and technical explanations)

---

## 🛠️ Tech Stack
(Structured 3-column table: Category | Technology | Purpose & Role)

---

## 🏛️ System Architecture
(2-3 sentence overview of the end-to-end data flow and architectural paradigm)

---

## 📁 Project Structure
(Well-commented ASCII file tree inside code fence)

---

## ⚙️ Installation & Setup
(Clean numbered steps with multiline bash code blocks)

---

## 🔐 Environment Variables
(4-column table: Variable | Description | Example / Default | Required)

---

## 🌐 API Reference
(4-column table: Method | Endpoint | Description | Auth Required)

---

## 🗄️ Database Models
(3-column table: Model | Key Fields | Purpose & System Relationships)

---

## 📜 Available Scripts
(List of all confirmed npm scripts and their exact operational role)

---

========================
REPOSITORY CONTEXT
========================

${repositoryContext}

`;
};