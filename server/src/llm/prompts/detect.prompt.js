export function buildDetectPrompt(existingReadme) {
  return `
You are triaging an existing project README to decide how it should be updated.

Choose exactly one mode:

- **"full"**: Regenerate the README from scratch. Choose this when the existing
  README is a stub, contains mostly placeholder or template text, describes a
  clearly different project, has broken structure, or is so thin that patching
  it would produce worse results than starting fresh.

- **"patch"**: Update only the sections affected by recent changes. Choose this
  when the existing README is coherent and mostly accurate — it has real content,
  a reasonable structure, and a targeted update would touch a few sections rather
  than replacing the whole document.

When the two options are close, choose **"patch"**: it preserves existing
content, avoids unnecessary rewrites, and is cheaper to apply.

Return ONLY a JSON object in exactly this shape. No code fences, no extra keys,
no commentary:

{
  "mode": "full" | "patch",
  "reason": "One sentence explaining the choice."
}

Existing README:
---
${(existingReadme || "").trim() || "(empty)"}
---
`.trim();
}
