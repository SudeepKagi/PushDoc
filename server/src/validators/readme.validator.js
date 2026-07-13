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

export const validateReadme = (readmeMarkdown, knowledge = {}) => {
    const warnings        = [];
    const missingSections = [];
    let score             = 100;

    const packageInfo = knowledge.package || {};
    const routes      = knowledge.routes || [];
    const models      = knowledge.models || [];
    const features    = knowledge.features || { features: [], capabilities: [] };

    const headings = parseHeadings(readmeMarkdown);
    const codeBlocksCount = (readmeMarkdown.match(/```/g) || []).length;
    const wordCount = readmeMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const tablesCount = countTables(readmeMarkdown);

    if (codeBlocksCount % 2 !== 0) {
        warnings.push("Unbalanced code blocks: triple backticks (```) are not closed.");
        score -= 15;
    }

    const tableWarnings = checkTables(readmeMarkdown);
    for (const tw of tableWarnings) {
        warnings.push(tw);
        score -= 5;
    }

    const hierarchyWarnings = checkHeadingHierarchy(headings);
    for (const hw of hierarchyWarnings) {
        warnings.push(hw);
        score -= 5;
    }

    const duplicateWarnings = checkDuplicateHeadings(headings);
    for (const dw of duplicateWarnings) {
        warnings.push(dw);
        score -= 5;
    }

    for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(readmeMarkdown)) {
            warnings.push("README contains placeholder text or TODOs.");
            score -= 10;
            break;
        }
    }

    if (wordCount < MIN_WORD_COUNT) {
        warnings.push(`README word count is too short (${wordCount} words, minimum is ${MIN_WORD_COUNT}).`);
        score -= 15;
    }

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

    for (const section of REQUIRED_SECTIONS) {
        const found = headings.some((h) =>
            section.patterns.some((regex) => regex.test(h.text))
        );
        if (!found) {
            missingSections.push(section.name);
            score -= 10;
        }
    }

    if (routes.length > 0) {
        const hasApiSection = headings.some((h) =>
            /(api|endpoint|route)/i.test(h.text)
        );
        if (!hasApiSection) {
            missingSections.push("API Overview");
            score -= 10;
        }
    }

    if (models.length > 0) {
        const hasModelsSection = headings.some((h) =>
            /(model|schema|database)/i.test(h.text)
        );
        if (!hasModelsSection) {
            missingSections.push("Database Models");
            score -= 10;
        }
    }

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

    let routeHits = 0;
    const uniquePaths = Array.from(new Set(routes.map((r) => r.path)));
    for (const path of uniquePaths) {
        const escaped = escapeRegex(path).replace(/\\:\w+/g, "[^\\s\\n`'\"]+");
        const regex   = new RegExp(escaped, "i");
        if (regex.test(readmeMarkdown)) {
            routeHits++;
        } else {
            if (uniquePaths.indexOf(path) < 5) {
                warnings.push(`API endpoint path "${path}" is not documented in the README.`);
            }
            score -= 2;
        }
    }
    const apiCoverage = uniquePaths.length > 0 ? routeHits / uniquePaths.length : 1.0;

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

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
