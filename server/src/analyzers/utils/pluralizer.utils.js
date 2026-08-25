/**
 * Pluralizer & Collection Inferrer — pluralizer.utils.js
 *
 * Infers MongoDB collection names from model names using standard English
 * pluralization rules and common irregular nouns (e.g. User -> users, Person -> people).
 */

const IRREGULAR_PLURALS = Object.freeze({
    person:     "people",
    man:        "men",
    woman:      "women",
    child:      "children",
    tooth:      "teeth",
    foot:       "feet",
    mouse:      "mice",
    goose:      "geese",
    ox:         "oxen",
    leaf:       "leaves",
    knife:      "knives",
    life:       "lives",
    wife:       "wives",
    half:       "halves",
    shelf:      "shelves",
    wolf:       "wolves",
    self:       "selves",
    elf:        "elves",
    loaf:       "loaves",
    potato:     "potatoes",
    tomato:     "tomatoes",
    cactus:     "cacti",
    focus:      "foci",
    fungus:     "fungi",
    nucleus:    "nuclei",
    syllabus:   "syllabi",
    analysis:   "analyses",
    diagnosis:  "diagnoses",
    oasis:      "oases",
    thesis:     "theses",
    crisis:     "crises",
    basis:      "bases",
    datum:      "data",
    medium:     "media",
    curriculum: "curricula",
    quiz:       "quizzes",
});

/**
 * Infers the default MongoDB collection name from a Mongoose model name.
 *
 * @param {string} modelName - Model name (e.g. "Listing", "User", "Person")
 * @returns {string|null} - Pluralized lowercase collection name (e.g. "listings", "users", "people")
 */
export function inferCollectionName(modelName) {
    if (!modelName) return null;

    const lower = modelName.toLowerCase();

    // Check irregular plural dictionary
    if (IRREGULAR_PLURALS[lower]) {
        return IRREGULAR_PLURALS[lower];
    }

    // Suffix rules: words ending in s, x, z, ch, sh -> add "es"
    if (/(?:s|x|z|ch|sh)$/.test(lower)) {
        return lower + "es";
    }

    // Words ending in consonant + y -> change y to "ies"
    if (/[^aeiou]y$/.test(lower)) {
        return lower.slice(0, -1) + "ies";
    }

    // Standard plural: append "s"
    return lower + "s";
}
