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

export function buildPatchReadmePrompt(context) {
  const sectionList = context.sections
    .map(
      (section) =>
        `### ${section.name}\nHeading line to reproduce verbatim: ${section.heading}\nCurrent content:\n\`\`\`markdown\n${section.content}\n\`\`\`\n`,
    )
    .join("\n");

  const changedFiles =
    context.changedFiles.length > 0
      ? context.changedFiles
          .map(
            (file) =>
              `### \`${file.path}\` (${file.status || "modified"})\n\`\`\`${file.language || ""}\n${file.content}\n\`\`\`\n`,
          )
          .join("\n")
      : "(none)";

  const forbidden =
    context.forbiddenSections.length > 0
      ? context.forbiddenSections.join(", ")
      : "(none)";

  return `
You are a technical writer maintaining an existing README.md. A commit just
landed in the repository. Your job is to rewrite ONLY the sections that the
commit made inaccurate, incomplete, or outdated — and to improve their prose
quality and visual formatting while doing so.

You are NOT regenerating the README. Any section you do not return is kept
exactly as-is. Returning fewer sections is always better than returning more.

## Repository

${context.repoOwner}/${context.repoName}

## Repository Structure

\`\`\`
${context.repoStructure || "(not available)"}
\`\`\`

## Commit Changes

\`\`\`
${context.commitDiff || "(no diff available)"}
\`\`\`

## Changed File Contents

${changedFiles}

## Existing README Sections

${sectionList}

## Content rules

- Return a section ONLY if the commit above genuinely made it wrong,
  incomplete, or outdated. If nothing is affected, return an empty "updates"
  array.
- Use ONLY the exact section names listed above. Never invent, rename, split,
  merge, or delete a section.
- Never return these protected sections: ${forbidden}.
- Return at most ${context.maxSections} sections. Prefer the most affected ones.
- Each "content" value is the COMPLETE replacement Markdown for that section.
  It MUST begin with that section's "Heading line to reproduce verbatim" exactly
  as given — same text and same heading level.
- Change only what the commit invalidated. Preserve the structure, tone, and
  any unaffected detail of the surrounding section, including its existing
  emoji, badges, images, and diagrams.
- Base every change on the provided commit diff, changed files, and repository
  structure. Do not add features, commands, or configuration not visible there.
- Do not mention the commit, these instructions, or that you are an AI.

## Keeping visuals in sync

Visuals inside a section are facts too, and the same rule applies: change them
only when the commit changed the underlying fact.

### Tech Stack sections

- If the commit adds a dependency to a manifest (package.json,
  requirements.txt, pyproject.toml, go.mod, Cargo.toml, pom.xml) or adds a
  config file or Dockerfile that proves a new technology, add it to the Tech
  Stack section's table in the correct layer.
- If the commit removes the last evidence of a technology, remove it. Never
  remove a technology for any other reason.
- Never add a technology the commit does not prove. Never reorder or restyle
  unaffected rows.
- Render each technology as a badge, flat-square style:
  ![Label](https://img.shields.io/badge/Label-Color?style=flat-square&logo=logo&logoColor=logoColor)
- Take Label, Color, logo, and logoColor from this table:

${TECH_BADGES}

- Labels use \`_\` for spaces, \`--\` for a literal hyphen, and \`%2B\` for \`+\`.
- For a proven technology that is not in the table, use a neutral badge with no
  logo parameter: ![Label](https://img.shields.io/badge/Label-444444?style=flat-square).
  Never guess a logo slug or a brand color.

### Mermaid diagrams

- If a section already contains a Mermaid diagram and the commit adds, removes,
  renames, or rewires components that the diagram shows, return that section
  with the diagram updated. Keep unaffected node ids, labels, and edges exactly
  as they are.
- Every node and edge you add must be traceable to the commit diff, changed
  files, or repository structure.
- Do not add a diagram to a section that has none.
- Keep the diagram valid: at most 12 nodes; unique alphanumeric node ids; never
  \`end\` as an id; a space on both sides of every arrow; datastores as
  \`Db[("Name")]\`; no HTML in labels.
- If you add or change a node, update the legend under the diagram that maps
  nodes to file paths.

### Other visuals

- Do not touch the header block, banner, or badge row. They are not sections.
- Do not add images, banners, or badges other than Tech Stack badges as above.

## Formatting and visual quality standards

Apply these improvements when rewriting a section, in addition to the factual
updates required by the commit:

- Put every shell command in a fenced \`\`\`bash block, one command per line,
  no leading "$".
- Present configuration variables, CLI flags, or any list with 2+ attributes
  per item as a Markdown table: | Variable | Default | Description |.
- Use \`inline code\` for all command names, file paths, env var names,
  function names, and literal values.
- Use **bold** sparingly — only for the single most important term or outcome
  in a sentence.
- Use active voice, present tense, second person for instructions ("Run …",
  not "You should run …"). Cut filler and passive constructions.
- One consistent bullet style (\`-\`). Parallel phrasing within each list.
- Use a GitHub alert blockquote (\`> [!NOTE]\`, \`> [!WARNING]\`, followed by the
  text on the next line, also prefixed with \`> \`) only for genuinely important
  warnings or caveats, not for general information.
- No marketing language ("powerful", "seamlessly", "simply", "robust").

## Output

Return ONLY a valid JSON object in exactly this shape — no code fences, no
commentary:

{
  "updates": [
    { "section": "Installation", "content": "## Installation\\n\\nUpdated content..." }
  ]
}

JSON escaping rules. Invalid JSON discards your whole answer:

- Escape every newline inside "content" as \\n.
- Escape every double quote inside "content" as \\" and every backslash as \\\\.
- To keep escaping minimal, prefer Markdown images over HTML tags, and write
  Mermaid node labels without quotes when they contain only letters, digits,
  spaces, and hyphens (for example \`Api[Express API]\`). Otherwise escape the
  quotes.
- Keep a Mermaid block's line breaks as \\n so each statement stays on its own
  line.
`.trim();
}
