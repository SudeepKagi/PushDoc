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

  return `
You are a senior software engineer and technical writer. Your job is to write the
README that a developer *wants* when opening an unfamiliar repository for the
first time — accurate, visually well-structured, and free of filler.

Generate a complete, polished README.md for the repository described below,
using ONLY the provided repository structure, existing README, commit summary,
changed files, and source code.

## Absolute constraints

- Ground every statement in the provided context. You have no other knowledge.
- Do NOT invent features, commands, scripts, APIs, endpoints, environment
  variables, config keys, dependencies, version numbers, license names, or
  authors. If the context does not show it, leave it out.
- Prefer facts visible in source code over claims in the existing README. When
  they conflict, follow the code.
- Derive install and run instructions from real evidence: manifest files
  (package.json, pyproject.toml, go.mod, Cargo.toml, Dockerfile, Makefile,
  etc.), scripts, and entry points visible in the context. Never guess.
- If a conventional section has no supporting evidence, omit it entirely.
  Never write placeholder text or empty sections.

## Document structure

Produce sections in this order, including only those with real content:

1. **H1 title** — the repository name, correctly cased.
2. **Tagline** — one or two sentences: what the project does and who it is for.
   Write this as a standalone paragraph, *not* a heading. Make it crisp and
   specific — avoid generic phrases like "a powerful tool".
3. **Badges** — only reproduce badges that already exist in the existing README.
   Do not add new ones.
4. **Table of contents** — include only when the document has 5 or more H2
   sections. Use a simple bulleted list of anchor links.
5. **Features** — a concise bulleted list of concrete capabilities derived
   from the codebase. Each bullet: one short sentence, active verb, specific.
   Where helpful, use a two-column Markdown table (Feature | Details) to make
   a long feature list scannable.
6. **Demo / Screenshots** — only if the existing README references real image
   or media URLs. Preserve those links verbatim.
7. **Requirements / Prerequisites** — only what the code evidence demands.
8. **Installation** — exact steps, fenced code blocks with language hints,
   one command per line, no leading "$".
9. **Configuration** — environment variables and config options that appear in
   the source. Present as a Markdown table: Variable | Default | Description.
10. **Usage / Examples** — concrete, runnable examples derived from the code.
    Use fenced code blocks. Add a short explanation before each block.
11. **API / CLI reference** — only if the code exposes a formal API or CLI.
    Use tables or definition-style lists for parameters/flags.
12. **Project structure** — a pruned directory tree (use the provided repo
    structure) with a one-line annotation per top-level entry.
13. **Tests** — only if test scripts or test directories exist in the context.
14. **Roadmap / Known limitations** — only if the existing README or comments
    in the code mention future work or known issues.
15. **Contributing** — only if the existing README or a CONTRIBUTING file
    in the repo structure supports it.
16. **License** — only if stated in the existing README or a LICENSE file is
    visible in the repo structure.

## Visual and formatting standards

- Use active voice, present tense, second person for instructions ("Run",
  not "You should run" or "We can run"). Be direct and concise.
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
- Use blockquotes (\`>\`) for important notes or warnings — e.g.
  \`> **Note:** ...\` or \`> **Warning:** ...\` — but only when the information
  genuinely warrants extra emphasis.
- One consistent bullet style (\`-\`). Parallel phrasing within each list.
  No trailing punctuation inconsistency.
- Heading hierarchy: exactly one H1 (the title), H2 for top-level sections,
  H3 for subsections. Never skip levels.

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
- Begin immediately with the H1 title line.

Write the README now.
`.trim();
}
