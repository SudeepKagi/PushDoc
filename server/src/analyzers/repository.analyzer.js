import * as packageAnalyzer from "./package.analyzer.js";
import * as routeAnalyzer   from "./route.analyzer.js";
import * as modelAnalyzer   from "./model.analyzer.js";
import * as controllerAnalyzer from "./controller.analyzer.js";

export const analyzeRepository = (
    repository
) => {

    return {

        package:
            packageAnalyzer.analyzePackage(
                repository
            ),

        routes:
            routeAnalyzer.analyzeRoutes(
                repository
            ),

        models:
            modelAnalyzer.analyzeModels(
                repository
            ),

        controllers:
            controllerAnalyzer.analyzeControllers(
                repository
            ),

        features: null,

        folders: null,

        readme: null,

    };

};