import * as packageAnalyzer    from "./package.analyzer.js";
import * as routeAnalyzer      from "./route.analyzer.js";
import * as modelAnalyzer      from "./model.analyzer.js";
import * as controllerAnalyzer from "./controller.analyzer.js";
import * as featureAnalyzer    from "./feature.analyzer.js";

export const analyzeRepository = (
    repository
) => {

    const packageInfo =
        packageAnalyzer.analyzePackage(
            repository
        );

    const routes =
        routeAnalyzer.analyzeRoutes(
            repository
        );

    const models =
        modelAnalyzer.analyzeModels(
            repository
        );

    const controllers =
        controllerAnalyzer.analyzeControllers(
            repository
        );

    const features =
        featureAnalyzer.analyzeFeatures({
            package: packageInfo,
            routes,
            models,
            controllers,
        });

    return {

        package: packageInfo,

        routes,

        models,

        controllers,

        features,

        folders: null,

        readme: null,

    };

};
