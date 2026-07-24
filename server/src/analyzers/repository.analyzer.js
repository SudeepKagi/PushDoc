import * as packageAnalyzer    from "./package.analyzer.js";
import * as routeAnalyzer      from "./route.analyzer.js";
import * as modelAnalyzer      from "./model.analyzer.js";
import * as controllerAnalyzer from "./controller.analyzer.js";
import * as featureAnalyzer    from "./feature.analyzer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Project Type Detection
// ─────────────────────────────────────────────────────────────────────────────

const FRONTEND_FRAMEWORKS = new Set(["react", "vue", "angular", "@angular/core", "svelte", "@sveltejs/kit", "solid-js", "preact"]);
const BACKEND_FRAMEWORKS  = new Set(["express", "fastify", "koa", "hapi", "@hapi/hapi", "@nestjs/core", "restify"]);

/**
 * Classifies the repo as 'frontend', 'fullstack', or 'backend'.
 *
 * - frontend  : has a frontend framework, no backend framework, no server.js/app.js at root
 * - fullstack : has both frontend and backend signals
 * - backend   : default (Express/Mongoose projects, etc.)
 */
function detectProjectType(repository, packageInfo) {
    if (!packageInfo) return "backend";

    const deps = new Set(packageInfo.dependencies || []);

    const hasFrontend = [...FRONTEND_FRAMEWORKS].some(f => deps.has(f));
    const hasBackend  = [...BACKEND_FRAMEWORKS].some(f => deps.has(f));

    // A root server.js / app.js / index.js is a strong backend signal
    const hasServerFile = repository.files.some(f =>
        ["server.js", "app.js", "index.js"].includes(f.path.replace(/\\/g, "/"))
    );

    if (hasFrontend && (hasBackend || hasServerFile)) return "fullstack";
    if (hasFrontend) return "frontend";
    return "backend";
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const analyzeRepository = (
    repository
) => {

    const packageInfo =
        packageAnalyzer.analyzePackage(
            repository
        );

    const projectType = detectProjectType(repository, packageInfo);

    // Backend analyzers (routes, models, controllers) produce nothing useful
    // for pure frontend projects — skip them to avoid injecting empty noise
    // into the AI context and misleading the feature analyzer.
    const isBackend = projectType === "backend" || projectType === "fullstack";

    const routes =
        isBackend
            ? routeAnalyzer.analyzeRoutes(repository)
            : [];

    const models =
        isBackend
            ? modelAnalyzer.analyzeModels(repository)
            : [];

    const controllers =
        isBackend
            ? controllerAnalyzer.analyzeControllers(repository)
            : [];

    const features =
        featureAnalyzer.analyzeFeatures({
            projectType,
            package: packageInfo,
            routes,
            models,
            controllers,
        });

    return {

        projectType,

        package: packageInfo,

        routes,

        models,

        controllers,

        features,

        folders: null,

        readme: null,

    };

};