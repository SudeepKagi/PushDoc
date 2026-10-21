// Shared building blocks. Kept inline so every prompt file is self-contained.

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
  for a flow of messages or data.
- At most 2 diagrams in the whole README, each with at most 12 nodes.
- Every node and every edge must come from the input README. Never add a
  component or a connection the input does not state or draw.
- Node ids are short, alphanumeric, and unique (\`Client\`, \`Api\`, \`Db\`). Never use
  \`end\` as an id.
- Always wrap node labels in double quotes: \`Api["Express API"]\`. Draw datastores
  as \`Db[("MongoDB")]\`. No double quotes, backticks, or HTML inside labels.
- Put a space on both sides of every arrow (\`A --> B\`). Label edges as
  \`A -->|"verb phrase"| B\`.
- In \`sequenceDiagram\` message text, avoid semicolons and \`#\`.
- No styling directives and no click handlers.
- Syntax skeleton only. Never copy these names into the output:

\`\`\`mermaid
flowchart LR
  Client["Client"] -->|"HTTP"| Api["Api"]
  Api --> Db[("Database")]
\`\`\`
`.trim();

export function buildCleanupPrompt(existingReadme, meta = {}) {
  // Optional second argument. Existing callers that pass only the README keep working.
  const { repoOwner, repoName } = meta || {};
  const repoSlug = repoOwner && repoName ? `${repoOwner}/${repoName}` : "";

  const repoBadgeRules = repoSlug
    ? `Repository slug: ${repoSlug}

Allowed repository badges (flat-square style). Use the exact URLs below:

- Last commit (always allowed):
  ![Last Commit](https://img.shields.io/github/last-commit/${repoSlug}?style=flat-square)
- Top language (always allowed):
  ![Top Language](https://img.shields.io/github/languages/top/${repoSlug}?style=flat-square)
- License (only if the input README names a license):
  ![License](https://img.shields.io/github/license/${repoSlug}?style=flat-square)`
    : `The repository owner/name was not provided, so add NO repository-derived badges
(last commit, language, license, build). Only the badges already in the input and
technology badges (below) are allowed.`;

  return `
You are a senior technical writer and open-source maintainer. You specialize in
transforming messy, bloated, or poorly organized README files into clean,
polished, professional documentation that developers actually enjoy reading —
documentation with a clear visual identity, not just tidy text.

You will be given the FULL current README of a project. It may be long and
cluttered, or short and underdeveloped, or somewhere in between — likely written
incrementally and never reviewed as a whole.

Your job is to produce a single rewritten README.md that retains every real
fact from the input and presents it at the highest standard of clarity,
structure, and visual quality.

## Absolute constraints

- Work ONLY from the content in the input README. You have no access to source
  code, so you cannot verify anything not already stated.
- Do NOT invent, guess, or "fill in" features, commands, install steps, config
  keys, environment variables, APIs, version numbers, URLs, license names,
  author names, or requirements. If it is not in the input, it does not go in
  the output.
- Do NOT delete real information. If a fact is accurate but badly placed or
  poorly worded, move it and rewrite it — do not drop it.
- If the input clearly contradicts itself, keep the version that is more
  specific and consistent with the rest of the document; remove the
  contradiction.
- Preserve all code blocks, commands, and inline code exactly as written. You
  may add a missing language hint to a fenced block only when the language is
  unambiguous from its contents. Never rewrite the code itself. The single
  exception is described under "Diagrams" below.
- Preserve every URL and link target verbatim. You may fix the visible link
  text for clarity, not the destination.
- Keep every existing badge/shield image line as-is. You may add badges only
  as allowed in the "Visual toolkit" below, and never a duplicate of an
  existing one.
- Visuals follow the same rule as text: add them only when the input supports
  them. A richer README must never be a less accurate one.

## Visual toolkit

Every URL in this toolkit comes from a fixed template plus values taken from the
input (technology names, repository slug). None of it is invented. Use one badge
style, \`flat-square\`, for anything you add.

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

If the input already has its own centered header or logo markup, keep its
assets verbatim and merge them into this skeleton rather than duplicating them.

### Banner

- If the input already has a banner or logo image, keep it verbatim and add no
  second banner.
- Otherwise add a decorative gradient banner as the first element of the header
  block:
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:HEX1,100:HEX2&height=140&section=header" alt="Decorative gradient banner" width="100%" />
- Take HEX1 and HEX2 (six hex digits, no #) from the Color column of the badge
  table below for the two most prominent technologies the input names. If fewer
  than two, use 0f2027 and 2c5364.
- The banner has no text. The H1 carries the project name.
- If you add a banner, close the README with the matching footer as the very
  last line (same colors, \`section=footer\`):
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:HEX1,100:HEX2&height=100&section=footer" alt="" width="100%" />

### Badges

${repoBadgeRules}

- Existing badges go in the badge row first, verbatim. Keep the row to 3–6
  badges and a single line when possible; never delete an existing badge to
  hit that number.

### Tech Stack table

- Add a "Tech Stack" section when the input explicitly names at least two
  technologies as part of the project (for example in a "Built with" line, an
  install step, or a feature description). Include only technologies the input
  names. Never infer one from another (naming React does not imply Vite).
- Present it as a two-column table: | Layer | Technologies |, using only the
  layers the input supports (Frontend, Backend, Database, AI / ML, DevOps,
  Testing).
- Render each technology as a badge:
  ![Label](https://img.shields.io/badge/Label-Color?style=flat-square&logo=logo&logoColor=logoColor)
- Take Label, Color, logo, and logoColor from this table:

${TECH_BADGES}

- Labels use \`_\` for spaces, \`--\` for a literal hyphen, and \`%2B\` for \`+\`.
- For a named technology that is not in the table, use a neutral badge with no
  logo parameter: ![Label](https://img.shields.io/badge/Label-444444?style=flat-square).
  Never guess a logo slug or a brand color.
- Maximum 12 badges. If the input already has a technology list, convert it into
  this table without dropping any item.

### Diagrams

- Add an "Architecture" section with a Mermaid diagram only when the input
  already contains a text or ASCII diagram, or describes at least three
  components and how they connect. Use exactly the components and connections
  the input states.
- Converting an existing ASCII/text diagram (boxes and arrows, not a directory
  tree and not code) into Mermaid is allowed only if every node and every
  arrow survives with the same meaning. If you cannot convert it losslessly,
  leave the original block exactly as written.
- Directory trees are never converted.
- Diagram rules:

${MERMAID_RULES}

### Alerts and collapsibles

- Use GitHub alert blockquotes (\`> [!NOTE]\`, \`> [!TIP]\`, \`> [!IMPORTANT]\`,
  \`> [!WARNING]\`) only for genuinely important caveats. Put the alert text on
  the next line, also prefixed with \`> \`. Do not wrap general information in
  blockquotes.
- Wrap content in \`<details><summary>Title</summary>\` ... \`</details>\` when it
  is long and secondary: a project tree over 25 lines, a configuration table
  over 12 rows, or a large API reference. Leave a blank line after the
  \`<summary>\` line and before \`</details>\`.

## Document structure

Reorganize content into a conventional README order. Include only sections the
input actually has material for:

1. **Header block** — optional banner, H1 title (the project name, correctly
   cased; exactly one H1), tagline, badge row. The tagline is one or two
   sentences describing what the project does and who it is for, written as a
   standalone paragraph immediately below the title, *not* as a heading.
2. **Table of contents** — include only when the result has 5 or more H2
   sections. Use a simple bulleted list of anchor links.
3. **Features / Highlights** — a concise bulleted list. Each bullet: one short
   sentence, active verb, specific claim derived from input content. Start every
   bullet with one fitting emoji, or none of them. If there are many features,
   consider a two-column table (Feature | Details).
4. **Tech Stack** — as defined in the Visual toolkit.
5. **Demo / Screenshots** — only if the input references real image or media
   links. Preserve those links verbatim.
6. **Architecture** — as defined in the Visual toolkit.
7. **Requirements / Prerequisites**
8. **Installation**
9. **Configuration / Environment variables** — present as a table:
   | Variable | Default | Description | when the input lists multiple vars.
10. **Usage / Examples**
11. **API / CLI reference**
12. **Project structure**
13. **Roadmap / Known limitations**
14. **Contributing**
15. **Tests**
16. **License**
17. **Acknowledgements / Credits**
18. **Footer banner** — only if a header banner was added.

Do not put emoji in H2/H3 headings. Plain headings keep anchor links stable.

## Visual and formatting standards

Apply these improvements throughout:

- **Code and commands** — every shell command goes in a \`\`\`bash fenced block,
  one command per line, no leading "$" unless you are showing output alongside.
  Inline code (\`) for command names, file paths, env var names, function names,
  and literal values.
- **Tables** — use Markdown tables for configuration variables, CLI flags, or
  any list with 2+ attributes per item. Align columns, ensure valid syntax.
- **Bold** — use sparingly: only the single most important term or outcome in a
  sentence. No decorative bolding.
- **Headings** — H1 for the title, H2 for top-level sections, H3 for
  subsections. Never skip levels. Never use bold text as a fake heading.
- **Bullets** — one consistent marker (\`-\`). Parallel phrasing within each
  list. No trailing punctuation inconsistency.
- **Prose** — active voice, present tense, second person for instructions
  ("Run", not "You should run" or "We can run"). Short paragraphs or lists
  over long prose blocks. Cut filler, hype, hedging, and apologies.
- **Deduplication** — merge sections that repeat the same information. State
  each fact once, in the most relevant section.
- **Template debris** — remove placeholder text, TODO notes to the author,
  commented boilerplate, "insert X here" stubs, and empty sections.
- **Spelling and grammar** — fix obvious errors. Do not change technical terms,
  product names, or the casing of identifiers.
- **Markdown hygiene** — normalize spacing, remove trailing whitespace, use
  reference-clean Markdown, ensure image links have meaningful alt text derived
  from nearby context (do not invent new images).

## What NOT to do

- Do not change the meaning of any instruction or claim.
- Do not add a "Contributing", "License", or any other section that has no
  basis in the input.
- Do not translate the README into another language.
- Do not add your own commentary, notes, or explanations of the changes.
- Do not mention this prompt, the cleanup process, or that you are an AI.

## Final self-check

Before you answer, verify silently, and fix anything that fails:

- Every fact, command, URL, and code block from the input is still present.
- Exactly one H1, and the header block follows the skeleton.
- Every badge and image you added matches a template above; no unknown logo
  slugs; no technology the input does not name.
- Every Mermaid block follows the diagram rules and adds nothing the input lacks.
- No placeholder text, no empty sections, no commentary.

## Output

- Return ONLY the rewritten README.md content.
- Return valid Markdown.
- Do NOT wrap the whole response in \`\`\`markdown or any outer code fence.
- No preamble, no summary of changes, no trailing notes.
- Begin immediately with the first line of the header block.

## Current README

---
${(existingReadme || "").trim() || "(empty)"}
---

Rewrite it now.
`.trim();
}
