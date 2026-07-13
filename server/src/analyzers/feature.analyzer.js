/**
 * Feature Analyzer V1 (Intelligence Layer)
 *
 * WHY THIS EXISTS
 * ───────────────
 * The LLM should not guess or hallucinate high-level features and capabilities.
 * Rather than letting the LLM read raw code and infer features (which consumes tokens
 * and is non-deterministic), this analyzer acts as an intelligence layer.
 * It consumes the structured outputs of all previous analyzers (Package, Route, Model,
 * and Controller) and synthesises them deterministically into user-facing features and
 * technical capabilities.
 *
 * WHY THIS DESIGN
 * ───────────────
 * This analyzer is completely decoupled from files and source code parsing.
 * It is a pure, deterministic function of the aggregated "Repository Knowledge".
 * It aggregates:
 *   1. Technology stack dependencies from Package Analyzer (e.g. passport, stripe).
 *   2. Database models from Model Analyzer.
 *   3. Business operations and integrations from Controller Analyzer.
 *
 * It maps these outputs to a structured set of { features, capabilities } that
 * maps perfectly to what is required for the project README.
 *
 * FUTURE SCALABILITY
 * ──────────────────
 * - Since this layer only depends on the schema of the other analyzer outputs,
 *   we can support NestJS, Prisma, Fastify, etc., and as long as they populate
 *   the models/controllers metadata format, this feature inference engine
 *   will work without modifications.
 * - We can easily add new inference rules (e.g., adding Kafka or S3 integrations)
 *   by simply adding objects to the rule matching arrays.
 *
 * LIMITATIONS
 * ───────────
 * - The analyzer is deterministic. If a feature does not use known frameworks,
 *   models, or controller operations, it won't be inferred.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Synthesises high-level features and capabilities from repository knowledge.
 *
 * @param {object} knowledge
 * @param {object} knowledge.package      Output of Package Analyzer
 * @param {array}  knowledge.routes       Output of Route Analyzer
 * @param {array}  knowledge.models       Output of Model Analyzer
 * @param {array}  knowledge.controllers  Output of Controller Analyzer
 * @returns {object} { features: [], capabilities: [] }
 */
export const analyzeFeatures = (knowledge) => {
    const packageInfo = knowledge.package || {};
    const models      = knowledge.models || [];
    const controllers = knowledge.controllers || [];

    // Collect all unique dependencies
    const dependencies = new Set(packageInfo.dependencies || []);

    // Collect all unique controller operations and models referenced
    const controllerOps = new Set();
    const controllerModels = new Set();
    for (const ctrl of controllers) {
        for (const exp of ctrl.exports || []) {
            for (const op of exp.operations || []) {
                controllerOps.add(op);
            }
            for (const m of exp.models || []) {
                controllerModels.add(m);
            }
        }
    }

    const capabilities = inferCapabilities(dependencies, controllerOps, models);
    const features     = inferFeatures(dependencies, controllerOps, models, controllerModels);

    return {
        features,
        capabilities,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Capability Inference (Deterministic Tags)
// ─────────────────────────────────────────────────────────────────────────────

function inferCapabilities(dependencies, controllerOps, models) {
    const caps = new Set();

    // 1. Database / CRUD
    if (models.length > 0) {
        caps.add("CRUD");
    }

    // 2. Authentication
    if (
        dependencies.has("passport") ||
        dependencies.has("passport-local-mongoose") ||
        dependencies.has("jsonwebtoken") ||
        controllerOps.has("Authenticate User") ||
        models.some((m) => m.name === "User")
    ) {
        caps.add("Authentication");
    }

    // 3. Image Upload
    if (
        dependencies.has("cloudinary") ||
        dependencies.has("multer-storage-cloudinary") ||
        controllerOps.has("Upload Image")
    ) {
        caps.add("Image Upload");
    }

    // 4. Payments
    if (
        dependencies.has("stripe") ||
        dependencies.has("razorpay") ||
        controllerOps.has("Process Payment")
    ) {
        caps.add("Payments");
    }

    // 5. Geolocation
    if (
        dependencies.has("mapbox") ||
        dependencies.has("@mapbox/mapbox-sdk") ||
        controllerOps.has("Geocode Location")
    ) {
        caps.add("Geolocation");
    }

    // 6. Email
    if (
        dependencies.has("nodemailer") ||
        controllerOps.has("Send Email")
    ) {
        caps.add("Email");
    }

    // 7. Caching
    if (
        dependencies.has("redis") ||
        dependencies.has("ioredis") ||
        controllerOps.has("Cache Data")
    ) {
        caps.add("Caching");
    }

    // 8. Background Jobs
    if (
        dependencies.has("bullmq") ||
        dependencies.has("bull") ||
        controllerOps.has("Background Jobs")
    ) {
        caps.add("Background Jobs");
    }

    return Array.from(caps);
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Inference (Title + Description)
// ─────────────────────────────────────────────────────────────────────────────

function inferFeatures(dependencies, controllerOps, models, controllerModels) {
    const features = [];
    const inferredTitles = new Set();

    // Helper to push unique features
    const addFeature = (title, description) => {
        if (!inferredTitles.has(title)) {
            features.push({ title, description });
            inferredTitles.add(title);
        }
    };

    // 1. Authentication Feature
    if (
        dependencies.has("passport") ||
        dependencies.has("passport-local-mongoose") ||
        dependencies.has("jsonwebtoken") ||
        controllerOps.has("Authenticate User") ||
        models.some((m) => m.name === "User")
    ) {
        addFeature("Authentication", "Users can register, login and logout.");
    }

    // 2. Image Upload
    if (dependencies.has("cloudinary") || controllerOps.has("Upload Image")) {
        addFeature("Image Upload", "Listings support image uploads using Cloudinary.");
    }

    // 3. Geolocation
    if (dependencies.has("mapbox") || controllerOps.has("Geocode Location")) {
        addFeature("Geolocation", "Integrates Mapbox for location geocoding and mapping services.");
    }

    // 4. Payment Processing
    if (dependencies.has("stripe") || dependencies.has("razorpay") || controllerOps.has("Process Payment")) {
        const provider = dependencies.has("razorpay") ? "Razorpay" : "Stripe";
        addFeature("Payment Processing", `Enables secure payment processing via ${provider}.`);
    }

    // 5. Email Notifications
    if (dependencies.has("nodemailer") || controllerOps.has("Send Email")) {
        addFeature("Email Notifications", "Sends transactional emails and alerts using Nodemailer.");
    }

    // 6. Background Jobs
    if (dependencies.has("bullmq") || dependencies.has("bull") || controllerOps.has("Background Jobs")) {
        addFeature("Background Processing", "Manages asynchronous workflows and queue processing using BullMQ.");
    }

    // 7. Model CRUD features
    // For each model in the database that is NOT the User model, we infer a feature description
    // based on what operations the controller performs on it.
    for (const model of models) {
        const modelName = model.name;
        if (modelName === "User") continue;

        // Determine description based on operations
        const hasCreate = controllerOps.has(`Create ${modelName}`);
        const hasDelete = controllerOps.has(`Delete ${modelName}`);
        const hasUpdate = controllerOps.has(`Update ${modelName}`);
        const hasFind   = controllerOps.has(`Find ${pluralize(modelName)}`);

        const plural = pluralize(modelName.toLowerCase());

        if (hasCreate && hasDelete && hasUpdate && hasFind) {
            addFeature(
                `${modelName} Management`,
                `Users can create, edit, delete and browse ${plural}.`
            );
        } else if (hasCreate && hasDelete) {
            addFeature(
                `${modelName} System`,
                `Users can add and remove ${plural}.`
            );
        } else {
            // Default generic description
            addFeature(
                `${modelName} Management`,
                `Provides database storage and operations for managing ${plural}.`
            );
        }
    }

    return features;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pluralization Helper (standard irregular and suffix plurals)
// ─────────────────────────────────────────────────────────────────────────────

function pluralize(name) {
    const lower = name.toLowerCase();
    const irregulars = {
        person: "people",
        man:    "men",
        woman:  "women",
        child:  "children",
        tooth:  "teeth",
        foot:   "feet",
        mouse:  "mice",
        goose:  "geese",
    };

    if (irregulars[lower]) return irregulars[lower];
    if (/(?:s|x|z|ch|sh)$/.test(lower)) return name + "es";
    if (/[^aeiou]y$/.test(lower)) return name.slice(0, -1) + "ies";
    return name + "s";
}