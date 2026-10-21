// Shared building blocks. Kept inline so every prompt file is self-contained.
// (If you later want to DRY these up, move them into prompts/shared.js.)

const TECH_BADGES = `
| Technology | Label | Color | logo | logoColor |
| --- | --- | --- | --- | --- |
| JavaScript | JavaScript | F7DF1E | javascript | black |
| TypeScript | TypeScript | 3178C6 | typescript | white |
| Python | Python | 3776AB | python | white |
| Node.js | Node.js | 339933 | nodedotjs | white |
| React | React | 20232A | react | 61DAFB |
| Next.js | Next.js | 000000 | nextdotjs | white |
| Vite | Vite | 646CFF | vite | white |
| Tailwind CSS | Tailwind_CSS | 06B6D4 | tailwindcss | white |
| Express | Express | 000000 | express | white |
| FastAPI | FastAPI | 009688 | fastapi | white |
| Flask | Flask | 000000 | flask | white |
| Django | Django | 092E20 | django | white |
| MongoDB | MongoDB | 47A248 | mongodb | white |
| PostgreSQL | PostgreSQL | 4169E1 | postgresql | white |
| MySQL | MySQL | 4479A1 | mysql | white |
| Redis | Redis | DC382D | redis | white |
| SQLite | SQLite | 003B57 | sqlite | white |
| Firebase | Firebase | FFCA28 | firebase | black |
| Supabase | Supabase | 3ECF8E | supabase | white |
| Prisma | Prisma | 2D3748 | prisma | white |
| GraphQL | GraphQL | E10098 | graphql | white |
| Socket.IO | Socket.IO | 010101 | socketdotio | white |
| Docker | Docker | 2496ED | docker | white |
| Kubernetes | Kubernetes | 326CE5 | kubernetes | white |
| GitHub Actions | GitHub_Actions | 2088FF | githubactions | white |
| Vercel | Vercel | 000000 | vercel | white |
| Go | Go | 00ADD8 | go | white |
| Rust | Rust | 000000 | rust | white |
| Java | Java | ED8B00 | openjdk | white |
| Spring Boot | Spring_Boot | 6DB33F | springboot | white |
| Jest | Jest | C21325 | jest | white |
| Vitest | Vitest | 6E9F18 | vitest | white |
| Redux | Redux | 764ABC | redux | white |
| Material UI | Material_UI | 007FFF | mui | white |
| Gemini | Gemini | 8E75B2 | googlegemini | white |
| Hugging Face | Hugging_Face | FFD21E | huggingface | black |
| PyTorch | PyTorch | EE4C2C | pytorch | white |
| TensorFlow | TensorFlow | FF6F00 | tensorflow | white |
`.trim();

const MERMAID_RULES = `
- Use a fenced block with the \`mermaid\` language hint. GitHub renders it natively.
- Use \`flowchart LR\` or \`flowchart TD\` for architecture and \`sequenceDiagram\`
  for a request or data flow. Use \`erDiagram\` only when real models or schemas
  are visible in the code.
- At most 2 diagrams in the whole README, each with at most 12 nodes. Fewer,
  clearer nodes beat exhaustive ones.
- Every node and every edge must be traceable to the context: folders, modules,
  services, routes, database calls, queue producers/consumers, and outbound API
  calls that actually appear. Never draw a component because "projects like this
  usually have one".
- Node ids are short, alphanumeric, and unique (\`Client\`, \`Api\`, \`Db\`). Never use
  \`end\` as an id.
- Always wrap node labels in double quotes: \`Api["Express API"]\`. Draw datastores
  as \`Db[("MongoDB")]\`. No double quotes, backticks, or HTML inside labels.
- Put a space on both sides of every arrow (\`A --> B\`). Label edges as
  \`A -->|"verb phrase"| B\`.
- Use \`subgraph Name["Title"]\` ... \`end\` only when grouping layers (client,
  server, external) makes the diagram clearer.
- In \`sequenceDiagram\` message text, avoid semicolons and \`#\`. Declare
  participants as \`participant Api as Express API\`.
- No styling directives and no click handlers.
- Directly under each diagram, add a short bulleted legend mapping the key nodes
  to real file or folder paths, for example: \`Api\` — \`server/index.js\`.
- Syntax skeleton only. Never copy these names into the output:

\`\`\`mermaid
flowchart LR
  Client["Client"] -->|"HTTP"| Api["Api"]
  Api --> Db[("Database")]
\`\`\`
`.trim();

export function buildFullReadmePrompt(context) {
  const {
    repoOwner,
    repoName,
    repoStructure,
    existingReadme,
    commitDiff,
    changedFiles = [],
    fullCodebase = [],
  } = context;

  const renderFiles = (files) =>
    files.length > 0
      ? files
          .map(
            (file) =>
              `### \`${file.path}\`${file.status ? ` (${file.status})` : ""}\n\`\`\`${file.language || ""}\n${file.content}\n\`\`\`\n`,
          )
          .join("\n")
      : "(none)";

  const repoSlug = repoOwner && repoName ? `${repoOwner}/${repoName}` : "";

  const repoBadgeRules = repoSlug
    ? `Repository slug: ${repoSlug}

Allowed header badges. Use the exact URLs below, nothing else:

- Last commit (always allowed):
  ![Last Commit](https://img.shields.io/github/last-commit/${repoSlug}?style=flat-square)
- Top language (always allowed):
  ![Top Language](https://img.shields.io/github/languages/top/${repoSlug}?style=flat-square)
- License (only if a LICENSE file appears in the repository structure, or the
  existing README names a license):
  ![License](https://img.shields.io/github/license/${repoSlug}?style=flat-square)
- Build status (only if a workflow file appears under .github/workflows/ in the
  repository structure; use its exact filename):
  ![Build](https://img.shields.io/github/actions/workflow/status/${repoSlug}/<exact-workflow-filename>?style=flat-square)
- Package version (only if the existing README already links the package on npm
  or PyPI; reuse that package name exactly).
- Live demo (only if a demo URL appears in the existing README; link to that URL
  verbatim):
  [![Live Demo](https://img.shields.io/badge/Live_Demo-2ea44f?style=flat-square)](<demo-url-from-existing-readme>)
- PRs welcome (only if the existing README or a CONTRIBUTING file in the
  repository structure supports contributing):
  ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)`
    : `The repository owner/name is unknown, so skip every repository-derived badge
(last commit, language, license, build). Only existing badges and a live-demo
badge backed by the existing README are allowed.`;

  return `
You are a senior software engineer, technical writer, and developer-relations
lead. Your job is to write the README that a developer *wants* when opening an
unfamiliar repository for the first time — accurate, visually polished,
scannable in ten seconds, and free of filler. A new user, a contributor, and a
recruiter should each find what they need without hunting for it.

Generate a complete, polished README.md for the repository described below,
using ONLY the provided repository structure, existing README, commit summary,
changed files, and source code.

## Absolute constraints

- Ground every statement in the provided context. You have no other knowledge.
- Do NOT invent features, commands, scripts, APIs, endpoints, environment
  variables, config keys, dependencies, version numbers, license names,
  authors, or demo/live URLs. If the context does not show it, leave it out.
- Prefer facts visible in source code over claims in the existing README. When
  they conflict, follow the code.
- Derive install and run instructions from real evidence: manifest files
  (package.json, pyproject.toml, go.mod, Cargo.toml, Dockerfile, Makefile,
  etc.), scripts, and entry points visible in the context. Never guess.
- If a conventional section has no supporting evidence, omit it entirely.
  Never write placeholder text or empty sections.
- Visuals follow the same rule as text. The banner, badges, tech-stack table,
  and diagrams defined in the "Visual toolkit" below are REQUIRED whenever the
  context supports them and FORBIDDEN when it does not. A richer README must
  never be a less accurate one.

## Work method

Before writing a single line, silently build an evidence inventory from the
context. Use it to write; never output it.

1. **Identity** — project name, what it does, who it is for.
2. **Stack** — every language, framework, library, database, and service proven
   by manifests (package.json, requirements.txt, pyproject.toml, go.mod,
   Cargo.toml, pom.xml), config files (vite.config.*, tailwind.config.*,
   Dockerfile, docker-compose.yml, .github/workflows/*), and imports in source.
3. **Components** — top-level folders, modules, and services, and how they
   connect (imports, HTTP routes, queue producers/consumers, database calls,
   outbound API calls).
4. **Flow** — the main path through the system, from entry point to result.
5. **Commands** — scripts and entry points that can actually be run.
6. **Configuration** — every environment variable or config key read in code or
   listed in an example env file.
7. **Existing assets** — images, banners, badges, demo links, and other URLs in
   the existing README. These are preserved verbatim.

## Visual toolkit

Every URL in this toolkit comes from a fixed template plus values taken from the
context (repository slug, detected technologies). None of it is invented. Use
one badge style, \`flat-square\`, everywhere.

### Header block

Open the README with a centered header block using this skeleton. Keep a blank
line between every element inside the div; GitHub only renders Markdown inside
HTML when blank lines surround it.

<div align="center">

(banner image, when allowed)

# Project Name

Tagline paragraph.

(badge row)

</div>

### Banner

- If the existing README already has a banner or logo image, keep that image
  verbatim at the top of the header block and add no second banner.
- Otherwise add a decorative gradient banner as the first element of the header
  block:
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:HEX1,100:HEX2&height=140&section=header" alt="Decorative gradient banner" width="100%" />
- Take HEX1 and HEX2 (six hex digits, no #) from the Color column of the badge
  table below for the project's two most prominent technologies. If fewer than
  two are known, use 0f2027 and 2c5364.
- The banner has no text. The H1 below it carries the project name.
- If you add a banner, close the README with the matching footer as the very
  last line (same colors, \`section=footer\`):
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:HEX1,100:HEX2&height=100&section=footer" alt="" width="100%" />

### Badges

- Reproduce every badge already in the existing README verbatim. Do not add a
  second badge that duplicates the purpose of an existing one.
- Add repository badges only from this list. Keep the header row to 3–6 badges
  total, on a single line separated by single spaces.

${repoBadgeRules}

### Tech Stack table

- Add a "Tech Stack" section whenever at least two technologies are proven by
  manifests, config files, or imports. List only technologies the context
  proves; a technology mentioned only in prose of the existing README, with no
  code evidence, is excluded.
- Present it as a two-column table: | Layer | Technologies |. Typical layers:
  Frontend, Backend, Database, AI / ML, DevOps, Testing. Use only the layers
  that have evidence.
- Render each technology as a badge using this template:
  ![Label](https://img.shields.io/badge/Label-Color?style=flat-square&logo=logo&logoColor=logoColor)
- Take Label, Color, logo, and logoColor from this table:

${TECH_BADGES}

- Labels use \`_\` for spaces, \`--\` for a literal hyphen, and \`%2B\` for \`+\`.
- For a proven technology that is not in the table, use a neutral badge with no
  logo parameter: ![Label](https://img.shields.io/badge/Label-444444?style=flat-square).
  Never guess a logo slug or a brand color.
- Maximum 12 badges in the table. Merge minor utilities rather than listing them.

### Diagrams

- Add an "Architecture" section containing one Mermaid diagram whenever the
  context shows at least three distinct components with visible relationships.
  Add a second diagram (sequence of the main flow) only if it explains something
  the first cannot.
- Omit diagrams entirely for single-file scripts or when relationships are
  unclear. Never fabricate structure to justify a diagram.
- Diagram rules:

${MERMAID_RULES}

### Alerts and collapsibles

- Use GitHub alert blockquotes (\`> [!NOTE]\`, \`> [!TIP]\`, \`> [!IMPORTANT]\`,
  \`> [!WARNING]\`) only for genuinely important caveats. Put the alert text on
  the next line, also prefixed with \`> \`.
- Wrap content in \`<details><summary>Title</summary>\` ... \`</details>\` when it
  is long and secondary: a project tree over 25 lines, a configuration table
  over 12 rows, or a large API reference. Leave a blank line after the
  \`<summary>\` line and before \`</details>\` so Markdown renders inside.

## Document structure

Produce sections in this order, including only those with real content:

1. **Header block** — banner, H1 title (the repository name, correctly cased;
   exactly one H1), tagline, badge row, as defined in the Visual toolkit.
   The tagline is one or two crisp, specific sentences on what the project does
   and who it is for, written as a standalone paragraph, *not* a heading. Avoid
   generic phrases like "a powerful tool".
2. **Table of contents** — include only when the document has 5 or more H2
   sections. Use a simple bulleted list of anchor links.
3. **Overview** — optional, 2–4 sentences on the problem, the approach, and the
   outcome, only if the code reveals more than the tagline already says.
4. **Features** — a concise bulleted list of concrete capabilities derived from
   the codebase. Each bullet: one short sentence, active verb, specific. Start
   every bullet with one fitting emoji, or none of them. Where a long list needs
   scanning, use a two-column table (Feature | Details).
5. **Tech Stack** — as defined in the Visual toolkit.
6. **Demo / Screenshots** — only if the existing README references real image or
   media URLs. Preserve those links verbatim, with meaningful alt text.
7. **Architecture** — as defined in the Visual toolkit.
8. **Requirements / Prerequisites** — only what the code evidence demands.
9. **Installation** — exact steps, fenced code blocks with language hints, one
   command per line, no leading "$".
10. **Configuration** — environment variables and config options that appear in
    the source. Present as a Markdown table: Variable | Default | Description.
11. **Usage / Examples** — concrete, runnable examples derived from the code.
    Use fenced code blocks. Add a short explanation before each block.
12. **API / CLI reference** — only if the code exposes a formal API or CLI. Use
    tables or definition-style lists for parameters and flags.
13. **Project structure** — a pruned directory tree (use the provided repo
    structure) with a one-line annotation per top-level entry.
14. **Tests** — only if test scripts or test directories exist in the context.
15. **Roadmap / Known limitations** — only if the existing README or comments in
    the code mention future work or known issues.
16. **Contributing** — only if the existing README or a CONTRIBUTING file in the
    repo structure supports it.
17. **License** — only if stated in the existing README or a LICENSE file is
    visible in the repo structure.
18. **Footer banner** — only if a header banner was added.

Do not put emoji in H2/H3 headings. Plain headings keep anchor links and
section names stable.

## Visual and formatting standards

- Use active voice, present tense, second person for instructions ("Run", not
  "You should run" or "We can run"). Be direct and concise.
- No marketing language ("powerful", "amazing", "seamlessly", "simply",
  "robust", "cutting-edge"). State facts, not adjectives.
- Use **bold** to highlight the most important term or outcome in a sentence,
  but sparingly — no more than one bold phrase per paragraph.
- Use \`inline code\` for all command names, file paths, environment variable
  names, function names, and literal values.
- Put every shell command in a fenced block with the \`bash\` hint; every JSON
  snippet with \`json\`; every config file with its actual language hint.
- Use tables for configuration variables, flags, or any list with two or more
  attributes per item.
- One consistent bullet style (\`-\`). Parallel phrasing within each list. No
  trailing punctuation inconsistency.
- Heading hierarchy: exactly one H1 (the title), H2 for top-level sections, H3
  for subsections. Never skip levels. Never use bold text as a fake heading.
- Every image has meaningful alt text derived from nearby context.

## Final self-check

Before you answer, verify silently, and fix anything that fails:

- Exactly one H1, and the header block follows the skeleton.
- Every badge and image URL matches a template above; no unknown logo slugs;
  no badge for something the context does not prove.
- Every Mermaid block follows the diagram rules and every node maps to real code.
- Every technology, feature, command, and variable is traceable to the context.
- No placeholder text, no empty sections, no commentary.

## Repository

${repoOwner || "(unknown)"}/${repoName || "(unknown)"}

## Repository Structure

\`\`\`
${repoStructure || "(not available)"}
\`\`\`

## Existing README

${existingReadme ? existingReadme : "(none)"}

## Commit Summary

\`\`\`
${commitDiff || "(no commit information)"}
\`\`\`

## Changed Files

${renderFiles(changedFiles)}

## Source Files

${renderFiles(fullCodebase)}

## Output

- Return ONLY the README.md content as raw Markdown.
- Do NOT wrap it in \`\`\`markdown or any outer code fence.
- Do NOT add commentary, notes, or an explanation of your choices.
- Do NOT mention this prompt or that you are an AI.
- Begin immediately with the first line of the header block.

Write the README now.
`.trim();
}
