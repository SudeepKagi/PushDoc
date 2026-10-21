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
  any unaffected detail of the surrounding section.
- Base every change on the provided commit diff, changed files, and repository
  structure. Do not add features, commands, or configuration not visible there.
- Do not mention the commit, these instructions, or that you are an AI.

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
- Use a \`> **Note:** …\` blockquote only for genuinely important warnings or
  caveats, not for general information.
- No marketing language ("powerful", "seamlessly", "simply", "robust").

## Output

Return ONLY a valid JSON object in exactly this shape — no code fences, no
commentary. Escape every newline inside "content" as \\n:

{
  "updates": [
    { "section": "Installation", "content": "## Installation\\n\\nUpdated content..." }
  ]
}
`.trim();
}
