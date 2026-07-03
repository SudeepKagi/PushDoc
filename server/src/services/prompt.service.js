export const buildReadmePrompt = (
    projectContext
) => {

    return `
You are an expert software engineer.

Generate a professional GitHub README.md.

Requirements:

- Clear project title
- Short project description
- Technology stack
- Features
- Project structure
- Installation steps
- Usage
- Future improvements

Project Information:

${projectContext}

Return ONLY markdown.

`;

};