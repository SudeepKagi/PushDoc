import * as aiManager from "../managers/ai.manager.js";

export const generateReadme = async (
    prompt
) => {

    return await aiManager.generateReadme(
        prompt
    );

};