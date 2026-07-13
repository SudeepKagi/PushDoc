import * as packageAnalyzer from "./package.analyzer.js";
import * as routeAnalyzer from "./route.analyzer.js";
import * as modelAnalyzer from "./model.analyzer.js";

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

        controllers: null,

        features: null,

        folders: null,

        readme: null,

    };

};