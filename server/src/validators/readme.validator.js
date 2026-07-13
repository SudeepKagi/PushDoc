/**
 * README Validator V1
 *
 * WHY DETERMINISTIC VALIDATION IS IMPORTANT
 * ─────────────────────────────────────────
 * Allowing the LLM to write a README without automated checks introduces quality drift.
 * Large Language Models can hallucinate, omit key endpoints, forget database schemas, or
 * introduce markdown formatting bugs (e.g., unclosed code blocks or broken tables).
 *
 * A deterministic validator runs locally, costing zero tokens and zero latency, ensuring
 * that the generated README adheres to structure, lists all inferred database models,
 * covers all router endpoints, and uses valid Markdown syntax.
 *
 * HOW IT SCALES
 * ──────────────
 * - The validator is designed as a standalone, deterministic test engine.
 * - If we want to add quality profiles (e.g., "minimalist" vs "exhaustive"), we can pass a
 *   `profile` parameter to `validateReadme()` and scale the scoring rules accordingly.
 * - For other formats (e.g., validating API docs or developer onboarding guides), we can inherit
 *   the same core MD parser functions.
 *
 * HOW IT ENABLES AUTO-REPAIR
 * ──────────────────────────
 * By returning structured arrays of `missingSections` and specific syntax `warnings`, the output
 * of this validator can be fed directly back into a second-pass "auto-repair" LLM prompt.
 * Instead of asking the AI to "regenerate the README", we can prompt:
 *   "Your README draft scored 75/100. Please fix the following missing sections: [API Overview]
 *    and close the open code block on line 24."
 * This makes self-healing pipelines extremely cheap and targeted.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MIN_WORD_COUNT = 150;

const REQUIRED_SECTIONS = [
    { name: "Project Description", patterns: [/(description|about|intro)/i] },
    { name: "Features",            patterns: [/(feature)/i] },
    { name: "Tech Stack",           patterns: [/(tech|stack|technolog|dependenc)/i] },
    { name: "Installation",         patterns: [/(install)/i] },
    { name: "Usage",                patterns: [/(usage|getting\s+started)/i] },
];

const PLACEHOLDER_PATTERNS = [
    /\[\s*(insert|your|todo|placeholder|fill|enter)\s*\]/i,
    /\b(TODO|FIXME)\b/,
    /lorem\s+ipsum/i,
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deterministically validates the generated README content.
 *
 * @param {string} readmeMarkdown
 * @param {object} knowledge        Repository knowledge (package, routes, models, etc.)
 * @returns {object} Validation result { valid, score, warnings, missingSections, statistics }
 */
export const validateReadme = (readmeMarkdown, knowledge = {}) => {
    const warnings        = [];
    const missingSections = [];
    let score             = 100;

    const packageInfo = knowledge.package || {};
    const routes      = knowledge.routes || [];
    const models      = knowledge.models || [];
    const features    = knowledge.features || { features: [], capabilities: [] };

    // 1. Structural Markdown Parsing
    const headings = parseHeadings(readmeMarkdown);
    const codeBlocksCount = (readmeMarkdown.match(/```/g) || []).length;
    const wordCount = readmeMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const tablesCount = countTables(readmeMarkdown);

    // 2. Validate Basic Syntax
    // Check balanced code blocks
    if (codeBlocksCount % 2 !== 0) {
        warnings.push("Unbalanced code blocks: triple backticks (```) are not closed.");
        score -= 15;
    }

    // Check table row formats
    const tableWarnings = checkTables(readmeMarkdown);
    for (const tw of tableWarnings) {
        warnings.push(tw);
        score -= 5;
    }

    // Check heading hierarchy
    const hierarchyWarnings = checkHeadingHierarchy(headings);
    for (const hw of hierarchyWarnings) {
        warnings.push(hw);
        score -= 5;
    }

    // Check duplicate headings
    const duplicateWarnings = checkDuplicateHeadings(headings);
    for (const dw of duplicateWarnings) {
        warnings.push(dw);
        score -= 5;
    }

    // Check placeholders
    for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(readmeMarkdown)) {
            warnings.push("README contains placeholder text or TODOs.");
            score -= 10;
            break; // Subtract once
        }
    }

    // Check word count
    if (wordCount < MIN_WORD_COUNT) {
        warnings.push(`README word count is too short (${wordCount} words, minimum is ${MIN_WORD_COUNT}).`);
        score -= 15;
    }

    // 3. Verify Project Name
    const firstH1 = headings.find((h) => h.level === 1);
    const expectedProjName = packageInfo.project?.name;
    if (firstH1 && expectedProjName) {
        const h1Clean = firstH1.text.toLowerCase().replace(/[^a-z0-9]/g, "");
        const pkgClean = expectedProjName.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!h1Clean.includes(pkgClean) && !pkgClean.includes(h1Clean)) {
            warnings.push(`Project name in H1 heading ("${firstH1.text}") does not match package.json project name ("${expectedProjName}").`);
            score -= 5;
        }
    }

    // 4. Verify Required Sections
    for (const section of REQUIRED_SECTIONS) {
        const found = headings.some((h) =>
            section.patterns.some((regex) => regex.test(h.text))
        );
        if (!found) {
            missingSections.push(section.name);
            score -= 10;
        }
    }

    // API Overview (required only if routes exist)
    if (routes.length > 0) {
        const hasApiSection = headings.some((h) =>
            /(api|endpoint|route)/i.test(h.text)
        );
        if (!hasApiSection) {
            missingSections.push("API Overview");
            score -= 10;
        }
    }

    // Database Models (required only if models exist)
    if (models.length > 0) {
        const hasModelsSection = headings.some((h) =>
            /(model|schema|database)/i.test(h.text)
        );
        if (!hasModelsSection) {
            missingSections.push("Database Models");
            score -= 10;
        }
    }

    // 5. Semantic / Coverage Checks
    // Inferred Features Coverage
    let featureHits = 0;
    const inferredFeatures = features.features || [];
    for (const feat of inferredFeatures) {
        const regex = new RegExp(escapeRegex(feat.title), "i");
        if (regex.test(readmeMarkdown)) {
            featureHits++;
        } else {
            warnings.push(`Inferred feature "${feat.title}" is missing or not documented in the README.`);
            score -= 5;
        }
    }
    const featureCoverage = inferredFeatures.length > 0 ? featureHits / inferredFeatures.length : 1.0;

    // Database Models Coverage
    let modelHits = 0;
    for (const model of models) {
        const regex = new RegExp(`\\b${escapeRegex(model.name)}\\b`, "i");
        if (regex.test(readmeMarkdown)) {
            modelHits++;
        } else {
            warnings.push(`Database model "${model.name}" is missing or not documented in the README.`);
            score -= 5;
        }
    }
    const modelCoverage = models.length > 0 ? modelHits / models.length : 1.0;

    // API Route Paths Coverage
    let routeHits = 0;
    const uniquePaths = Array.from(new Set(routes.map((r) => r.path)));
    for (const path of uniquePaths) {
        // Match paths robustly (e.g. /listings/:id or /listings)
        const escaped = escapeRegex(path).replace(/\\:\w+/g, "[^\\s\\n`'\"]+");
        const regex   = new RegExp(escaped, "i");
        if (regex.test(readmeMarkdown)) {
            routeHits++;
        } else {
            // Subtract points but limit warning verbosity for very large routers
            if (uniquePaths.indexOf(path) < 5) {
                warnings.push(`API endpoint path "${path}" is not documented in the README.`);
            }
            score -= 2;
        }
    }
    const apiCoverage = uniquePaths.length > 0 ? routeHits / uniquePaths.length : 1.0;

    // Ensure score bounds
    score = Math.max(0, Math.min(100, score));

    return {
        valid: score >= 90,
        score,
        warnings,
        missingSections,
        statistics: {
            headings:   headings.length,
            tables:     tablesCount,
            codeBlocks: Math.floor(codeBlocksCount / 2),
            wordCount,
            featureCoverage,
            apiCoverage,
            modelCoverage,
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Structural Parsers
// ─────────────────────────────────────────────────────────────────────────────

function parseHeadings(markdown) {
    const headings = [];
    const lines = markdown.split("\n");

    for (const line of lines) {
        const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
        if (match) {
            headings.push({
                level: match[1].length,
                text:  match[2].trim(),
            });
        }
    }

    return headings;
}

function countTables(markdown) {
    // A standard MD table has a row matching: |---| or similar
    const delimiterRegex = /\|?\s*:?-+:?\s*\|/g;
    return (markdown.match(delimiterRegex) || []).length;
}

function checkTables(markdown) {
    const lines = markdown.split("\n");
    let inTable = false;
    let colCount = 0;
    const warnings = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("|") && line.endsWith("|")) {
            const cols = line.split("|").length - 2;
            if (!inTable) {
                inTable = true;
                colCount = cols;
            } else {
                if (cols !== colCount) {
                    // Check if it is a delimiter row (often has dashes only)
                    const isDelimiter = /^[|:\-\s]+$/.test(line);
                    if (!isDelimiter) {
                        warnings.push(`Table row at line ${i + 1} has mismatched column count (expected ${colCount}, got ${cols}).`);
                    }
                }
            }
        } else {
            inTable = false;
        }
    }

    return warnings;
}

function checkHeadingHierarchy(headings) {
    const warnings = [];
    let lastLevel = 0;

    for (let i = 0; i < headings.length; i++) {
        const curr = headings[i];
        if (curr.level > lastLevel + 1) {
            warnings.push(`Heading level skipped: H${lastLevel} directly followed by H${curr.level} ("${curr.text}").`);
        }
        lastLevel = curr.level;
    }

    return warnings;
}

function checkDuplicateHeadings(headings) {
    const seen = new Set();
    const warnings = [];

    for (const h of headings) {
        if (seen.has(h.text)) {
            warnings.push(`Duplicate heading detected: "${h.text}".`);
        }
        seen.add(h.text);
    }

    return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// String Utilities
// ─────────────────────────────────────────────────────────────────────────────

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
