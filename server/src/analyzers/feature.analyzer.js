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
 * @param {string} knowledge.projectType   'frontend' | 'fullstack' | 'backend'
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
    const projectType = knowledge.projectType || "backend";

    // Collect all unique dependencies across runtime + dev
    const dependencies = new Set([
        ...(packageInfo.dependencies || []),
        ...(packageInfo.devDependencies || []),
    ]);

    if (projectType === "frontend") {
        return {
            features:     inferFrontendFeatures(dependencies),
            capabilities: inferFrontendCapabilities(dependencies),
        };
    }

    const controllerOps    = new Set();
    const controllerModels = new Set();
    for (const ctrl of controllers) {
        for (const exp of ctrl.exports || []) {
            for (const op of exp.operations || []) controllerOps.add(op);
            for (const m  of exp.models    || []) controllerModels.add(m);
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

/**
 * Returns capability tags with evidence arrays and confidence scores.
 * High-confidence facts come from deterministic dependency presence (score: 1.0).
 * Lower-confidence facts are inferred from controller operations alone (score: 0.8).
 */
function inferCapabilities(dependencies, controllerOps, models) {
    const caps = [];
    const seen = new Set();

    const addCap = (name, evidence, confidence = 1.0) => {
        if (!seen.has(name)) {
            caps.push({ name, evidence, confidence });
            seen.add(name);
        }
    };

    // CRUD — any models mean CRUD exists
    if (models.length > 0) {
        addCap("CRUD", [`${models.length} database model(s) detected`], 1.0);
    }

    // Authentication
    {
        const evidence = [];
        if (dependencies.has("passport"))                evidence.push("passport dependency");
        if (dependencies.has("passport-local-mongoose")) evidence.push("passport-local-mongoose dependency");
        if (dependencies.has("jsonwebtoken"))            evidence.push("jsonwebtoken dependency");
        if (dependencies.has("bcrypt") || dependencies.has("bcryptjs")) evidence.push("bcrypt dependency");
        if (controllerOps.has("Authenticate User"))     evidence.push("Authenticate User controller op");
        if (models.some(m => m.name === "User"))        evidence.push("User model exists");
        if (evidence.length > 0) {
            const confidence = evidence.length >= 2 ? 1.0 : 0.85;
            addCap("Authentication", evidence, confidence);
        }
    }

    // Image Upload
    {
        const evidence = [];
        if (dependencies.has("cloudinary"))                   evidence.push("cloudinary dependency");
        if (dependencies.has("multer-storage-cloudinary"))    evidence.push("multer-storage-cloudinary dependency");
        if (dependencies.has("multer"))                       evidence.push("multer dependency");
        if (controllerOps.has("Upload Image"))               evidence.push("Upload Image controller op");
        if (evidence.length > 0) addCap("Image Upload", evidence, evidence.length >= 2 ? 1.0 : 0.8);
    }

    // Payments
    {
        const evidence = [];
        if (dependencies.has("stripe"))              evidence.push("stripe dependency");
        if (dependencies.has("razorpay"))            evidence.push("razorpay dependency");
        if (controllerOps.has("Process Payment"))   evidence.push("Process Payment controller op");
        if (evidence.length > 0) addCap("Payments", evidence, evidence.length >= 2 ? 1.0 : 0.8);
    }

    // Geolocation
    {
        const evidence = [];
        if (dependencies.has("mapbox"))                  evidence.push("mapbox dependency");
        if (dependencies.has("@mapbox/mapbox-sdk"))      evidence.push("@mapbox/mapbox-sdk dependency");
        if (controllerOps.has("Geocode Location"))       evidence.push("Geocode Location controller op");
        if (evidence.length > 0) addCap("Geolocation", evidence, evidence.length >= 2 ? 1.0 : 0.8);
    }

    // Email
    {
        const evidence = [];
        if (dependencies.has("nodemailer"))          evidence.push("nodemailer dependency");
        if (dependencies.has("sendgrid") || dependencies.has("@sendgrid/mail")) evidence.push("sendgrid dependency");
        if (controllerOps.has("Send Email"))         evidence.push("Send Email controller op");
        if (evidence.length > 0) addCap("Email", evidence, evidence.length >= 2 ? 1.0 : 0.8);
    }

    // Caching
    {
        const evidence = [];
        if (dependencies.has("redis"))          evidence.push("redis dependency");
        if (dependencies.has("ioredis"))        evidence.push("ioredis dependency");
        if (controllerOps.has("Cache Data"))    evidence.push("Cache Data controller op");
        if (evidence.length > 0) addCap("Caching", evidence, 1.0);
    }

    // Background Jobs
    {
        const evidence = [];
        if (dependencies.has("bullmq"))                evidence.push("bullmq dependency");
        if (dependencies.has("bull"))                  evidence.push("bull dependency");
        if (controllerOps.has("Background Jobs"))     evidence.push("Background Jobs controller op");
        if (evidence.length > 0) addCap("Background Jobs", evidence, 1.0);
    }

    return caps;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Inference (Title + Description)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infers user-facing features with title, description, evidence, and confidence.
 *
 * Evidence arrays explain WHICH signals triggered the inference, making the
 * output interpretable by both AI prompts and developers reading debug logs.
 * Confidence scores reflect how many independent signals corroborate the feature:
 *   1.0 — multiple independent signals (dependency + controller op + model)
 *   0.9 — two signals
 *   0.8 — single strong signal (explicit dependency)
 *   0.65 — single weak signal (controller op or model name alone)
 */
function inferFeatures(dependencies, controllerOps, models, controllerModels) {
    const features = [];
    const inferredTitles = new Set();

    const addFeature = (title, description, evidence, confidence) => {
        if (!inferredTitles.has(title)) {
            features.push({ title, description, evidence, confidence });
            inferredTitles.add(title);
        }
    };

    // 1. Authentication Feature
    {
        const evidence = [];
        if (dependencies.has("passport"))               evidence.push("passport dependency");
        if (dependencies.has("passport-local-mongoose")) evidence.push("passport-local-mongoose dependency");
        if (dependencies.has("jsonwebtoken"))            evidence.push("jsonwebtoken dependency");
        if (controllerOps.has("Authenticate User"))     evidence.push("Authenticate User controller op");
        if (models.some(m => m.name === "User"))        evidence.push("User model exists");
        if (evidence.length > 0) {
            const confidence = evidence.length >= 3 ? 1.0 : evidence.length === 2 ? 0.9 : 0.8;
            addFeature("Authentication", "Users can register, login and logout.", evidence, confidence);
        }
    }

    // 2. Image Upload
    {
        const evidence = [];
        if (dependencies.has("cloudinary"))                  evidence.push("cloudinary dependency");
        if (dependencies.has("multer-storage-cloudinary"))   evidence.push("multer-storage-cloudinary dependency");
        if (dependencies.has("multer"))                      evidence.push("multer dependency");
        if (controllerOps.has("Upload Image"))               evidence.push("Upload Image controller op");
        if (evidence.length > 0) {
            addFeature("Image Upload", "Listings support image uploads using Cloudinary.", evidence, evidence.length >= 2 ? 1.0 : 0.8);
        }
    }

    // 3. Geolocation
    {
        const evidence = [];
        if (dependencies.has("mapbox"))               evidence.push("mapbox dependency");
        if (dependencies.has("@mapbox/mapbox-sdk"))   evidence.push("@mapbox/mapbox-sdk dependency");
        if (controllerOps.has("Geocode Location"))    evidence.push("Geocode Location controller op");
        if (evidence.length > 0) {
            addFeature("Geolocation", "Integrates Mapbox for location geocoding and mapping services.", evidence, evidence.length >= 2 ? 1.0 : 0.8);
        }
    }

    // 4. Payment Processing
    {
        const evidence = [];
        const provider = dependencies.has("razorpay") ? "Razorpay" : "Stripe";
        if (dependencies.has("stripe"))              evidence.push("stripe dependency");
        if (dependencies.has("razorpay"))            evidence.push("razorpay dependency");
        if (controllerOps.has("Process Payment"))   evidence.push("Process Payment controller op");
        if (evidence.length > 0) {
            addFeature("Payment Processing", `Enables secure payment processing via ${provider}.`, evidence, evidence.length >= 2 ? 1.0 : 0.8);
        }
    }

    // 5. Email Notifications
    {
        const evidence = [];
        if (dependencies.has("nodemailer"))       evidence.push("nodemailer dependency");
        if (dependencies.has("@sendgrid/mail"))   evidence.push("sendgrid dependency");
        if (controllerOps.has("Send Email"))      evidence.push("Send Email controller op");
        if (evidence.length > 0) {
            addFeature("Email Notifications", "Sends transactional emails and alerts using Nodemailer.", evidence, evidence.length >= 2 ? 1.0 : 0.8);
        }
    }

    // 6. Background Jobs
    {
        const evidence = [];
        if (dependencies.has("bullmq"))             evidence.push("bullmq dependency");
        if (dependencies.has("bull"))               evidence.push("bull dependency");
        if (controllerOps.has("Background Jobs"))  evidence.push("Background Jobs controller op");
        if (evidence.length > 0) {
            addFeature("Background Processing", "Manages asynchronous workflows and queue processing using BullMQ.", evidence, 1.0);
        }
    }

    // 7. Model CRUD features — one feature per non-User model
    for (const model of models) {
        const modelName = model.name;
        if (modelName === "User") continue;

        const evidence   = [`${modelName} model exists in database`];
        const hasCreate  = controllerOps.has(`Create ${modelName}`);
        const hasDelete  = controllerOps.has(`Delete ${modelName}`);
        const hasUpdate  = controllerOps.has(`Update ${modelName}`);
        const hasFind    = controllerOps.has(`Find ${pluralize(modelName)}`);

        if (hasCreate)  evidence.push(`Create ${modelName} controller op`);
        if (hasDelete)  evidence.push(`Delete ${modelName} controller op`);
        if (hasUpdate)  evidence.push(`Update ${modelName} controller op`);
        if (hasFind)    evidence.push(`Find ${pluralize(modelName)} controller op`);

        const plural     = pluralize(modelName.toLowerCase());
        const opCount    = [hasCreate, hasDelete, hasUpdate, hasFind].filter(Boolean).length;
        const confidence = opCount >= 3 ? 1.0 : opCount >= 1 ? 0.9 : 0.65;

        if (hasCreate && hasDelete && hasUpdate && hasFind) {
            addFeature(`${modelName} Management`, `Users can create, edit, delete and browse ${plural}.`, evidence, confidence);
        } else if (hasCreate && hasDelete) {
            addFeature(`${modelName} System`, `Users can add and remove ${plural}.`, evidence, confidence);
        } else {
            addFeature(`${modelName} Management`, `Provides database storage and operations for managing ${plural}.`, evidence, confidence);
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
// -----------------------------------------------------------------------------
// Frontend Feature Inference
// -----------------------------------------------------------------------------

/**
 * Maps frontend ecosystem dependencies to user-facing feature descriptions.
 * Called when projectType === 'frontend' instead of the backend inference path.
 */
function inferFrontendFeatures(dependencies) {
    const features = [];
    const added = new Set();

    const add = (title, description) => {
        if (!added.has(title)) {
            features.push({ title, description });
            added.add(title);
        }
    };

    // Routing
    if (dependencies.has("react-router-dom") || dependencies.has("react-router")) {
        add("Client-side Routing", "Multi-page navigation without full-page reloads using React Router.");
    }
    if (dependencies.has("next")) {
        add("File-based Routing", "Page routing handled automatically by Next.js file conventions.");
    }

    // State management
    if (dependencies.has("redux") || dependencies.has("@reduxjs/toolkit")) {
        add("Global State Management", "Application state managed centrally with Redux Toolkit.");
    }
    if (dependencies.has("zustand")) {
        add("Lightweight State Management", "Global state managed with Zustand.");
    }
    if (dependencies.has("jotai") || dependencies.has("recoil")) {
        add("Atomic State Management", "Fine-grained state management with atomic state primitives.");
    }
    if (dependencies.has("mobx") || dependencies.has("mobx-react")) {
        add("Reactive State Management", "Observable-based state management with MobX.");
    }

    // Data fetching
    if (dependencies.has("axios")) {
        add("HTTP API Integration", "Fetches data from external APIs using Axios.");
    }
    if (dependencies.has("@tanstack/react-query") || dependencies.has("react-query")) {
        add("Server State & Caching", "Declarative data fetching, caching, and synchronisation with React Query.");
    }
    if (dependencies.has("swr")) {
        add("Data Fetching with SWR", "Stale-while-revalidate data fetching strategy using SWR.");
    }
    if (dependencies.has("apollo-client") || dependencies.has("@apollo/client")) {
        add("GraphQL API Integration", "Queries and mutations via Apollo Client for GraphQL APIs.");
    }

    // Styling
    if (dependencies.has("tailwindcss")) {
        add("Utility-first Styling", "Rapid UI composition using Tailwind CSS utility classes.");
    }
    if (dependencies.has("styled-components")) {
        add("CSS-in-JS Styling", "Component-scoped styles authored with styled-components.");
    }
    if (dependencies.has("@emotion/react") || dependencies.has("@emotion/styled")) {
        add("CSS-in-JS Styling", "Component-scoped styles with Emotion.");
    }
    if (dependencies.has("sass") || dependencies.has("node-sass")) {
        add("SCSS Styling", "Extended CSS capabilities via SCSS.");
    }

    // Animations
    if (dependencies.has("framer-motion")) {
        add("Animations", "Smooth UI transitions and animations powered by Framer Motion.");
    }
    if (dependencies.has("gsap")) {
        add("Advanced Animations", "High-performance animations with GreenSock (GSAP).");
    }

    // Auth
    if (dependencies.has("next-auth") || dependencies.has("@auth/core")) {
        add("Authentication", "User sign-in and session management with NextAuth.");
    }
    if (dependencies.has("firebase") || dependencies.has("@firebase/auth")) {
        add("Firebase Authentication", "User authentication via Firebase Auth.");
    }

    // UI libraries
    if (dependencies.has("@mui/material") || dependencies.has("@material-ui/core")) {
        add("Material Design UI", "Component library based on Google's Material Design.");
    }
    if (dependencies.has("antd")) {
        add("Ant Design UI", "Enterprise-grade UI components from Ant Design.");
    }
    if (dependencies.has("@chakra-ui/react")) {
        add("Chakra UI Components", "Accessible component library built with Chakra UI.");
    }
    if (dependencies.has("@radix-ui/react-dialog") || dependencies.has("shadcn-ui")) {
        add("Headless UI Components", "Accessible, unstyled components from Radix UI / shadcn.");
    }

    // Charts
    if (dependencies.has("recharts") || dependencies.has("chart.js") || dependencies.has("react-chartjs-2")) {
        add("Data Visualisation", "Interactive charts and graphs for displaying data.");
    }

    // Forms
    if (dependencies.has("react-hook-form")) {
        add("Form Management", "Performant, flexible forms managed with React Hook Form.");
    }
    if (dependencies.has("formik")) {
        add("Form Management", "Form state and validation handled with Formik.");
    }

    // Maps
    if (dependencies.has("leaflet") || dependencies.has("react-leaflet")) {
        add("Interactive Maps", "Map rendering and geolocation features with Leaflet.");
    }
    if (dependencies.has("mapbox-gl") || dependencies.has("react-map-gl")) {
        add("Interactive Maps", "High-performance map rendering with Mapbox GL.");
    }

    return features;
}

/**
 * Infers capability tags for a frontend project from its dependencies.
 */
function inferFrontendCapabilities(dependencies) {
    const caps = new Set();

    if (dependencies.has("axios") || dependencies.has("swr") || dependencies.has("react-query") || dependencies.has("@tanstack/react-query")) {
        caps.add("API Integration");
    }
    if (dependencies.has("react-router-dom") || dependencies.has("next")) {
        caps.add("Client-side Routing");
    }
    if (dependencies.has("redux") || dependencies.has("@reduxjs/toolkit") || dependencies.has("zustand") || dependencies.has("jotai") || dependencies.has("mobx")) {
        caps.add("State Management");
    }
    if (dependencies.has("next-auth") || dependencies.has("firebase") || dependencies.has("@auth/core")) {
        caps.add("Authentication");
    }
    if (dependencies.has("framer-motion") || dependencies.has("gsap")) {
        caps.add("Animations");
    }
    if (dependencies.has("recharts") || dependencies.has("chart.js") || dependencies.has("react-chartjs-2")) {
        caps.add("Data Visualisation");
    }
    if (dependencies.has("react-hook-form") || dependencies.has("formik")) {
        caps.add("Form Handling");
    }

    return Array.from(caps);
}
