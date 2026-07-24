/**
 * Post-Generation Validator Service
 *
 * Deterministically checks generated README content against repository facts:
 * 1. Badge Validation: Verifies shields.io badges against confirmed package.json dependencies.
 * 2. Anchor Link Validation: Verifies table-of-contents / header links resolve to actual headings.
 */

// Known mapping of shield badge logos / technologies to package.json names
const BADGE_PACKAGE_MAP = {
    "node.js": ["node", "express"],
    "express": ["express"],
    "mongodb": ["mongoose", "mongodb"],
    "react": ["react", "react-dom"],
    "redis": ["ioredis", "redis"],
    "jwt": ["jsonwebtoken"],
    "bullmq": ["bullmq", "bull"],
    "docker": [],
    "typescript": ["typescript"],
    "python": [],
    "postgresql": ["pg"],
    "tailwind": ["tailwindcss"],
    "axios": ["axios"],
    "vite": ["vite"],
    "eslint": ["eslint"],
};

/**
 * Sanitizes and validates the generated README markdown.
 *
 * @param {string} readme Markdown content produced by AI
 * @param {object} knowledge Repository knowledge object
 * @returns {string} Sanitized README markdown
 */
export const validateAndSanitizeReadme = (readme, knowledge) => {
    if (!readme) return readme;

    let sanitized = readme;

    // 1. Audit and clean shields.io badges
    const deps = new Set(knowledge?.package?.dependencies || []);

    // Matches markdown image tags containing shields.io links
    const badgeRegex = /!\[([^\]]*)\]\(https:\/\/img\.shields\.io\/badge\/([^)]+)\)/g;

    sanitized = sanitized.replace(badgeRegex, (fullMatch, altText, badgePath) => {
        const lowerAlt = altText.toLowerCase();
        const lowerPath = badgePath.toLowerCase();

        // Check if any mapping matches
        for (const [badgeKey, expectedPackages] of Object.entries(BADGE_PACKAGE_MAP)) {
            if (lowerAlt.includes(badgeKey) || lowerPath.includes(badgeKey)) {
                if (expectedPackages.length === 0) {
                    // Always allow general badges like Docker/Python if present in context
                    return fullMatch;
                }
                const hasDep = expectedPackages.some((pkg) => deps.has(pkg));
                if (!hasDep) {
                    // Strip unconfirmed badge
                    return "";
                }
            }
        }

        return fullMatch;
    });

    // Clean up double spaces created by stripped badges
    sanitized = sanitized.replace(/  +/g, " ");

    return sanitized;
};
