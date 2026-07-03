export const buildProjectContext = (
    analysis
) => {

    const context = [];

    context.push(
        `Project Name: ${analysis.basicInfo.name}`
    );

    context.push(
        `Version: ${analysis.basicInfo.version}`
    );

    context.push(
        `Description: ${analysis.basicInfo.description}`
    );

    context.push("");

    context.push("Technology Stack:");

    context.push(
        `- Framework: ${analysis.technology.framework}`
    );

    context.push(
        `- Language: ${analysis.technology.language}`
    );

    context.push(
        `- Package Manager: ${analysis.technology.packageManager}`
    );

    context.push("");

    context.push("Capabilities:");

    for (const [key, value] of Object.entries(
        analysis.capabilities
    )) {

        context.push(
            `- ${key}: ${value}`
        );

    }

    context.push("");

    context.push("Architecture:");

    context.push(
        `- ${analysis.structure.architecture}`
    );

    context.push(
        `- Rendering: ${analysis.structure.rendering}`
    );

    context.push("");

    context.push("Models:");

    analysis.fileStructure.models.forEach(
        (model) => {

            context.push(
                `- ${model}`
            );

        }
    );

    context.push("");

    context.push("Controllers:");

    analysis.fileStructure.controllers.forEach(
        (controller) => {

            context.push(
                `- ${controller}`
            );

        }
    );

    context.push("");

    context.push("Routes:");

    analysis.fileStructure.routes.forEach(
        (route) => {

            context.push(
                `- ${route}`
            );

        }
    );

    return context.join("\n");

};