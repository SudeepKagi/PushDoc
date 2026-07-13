export const buildPrompt = (repositoryContext) => {

    return `
You are a senior software engineer.

Your task is to generate a professional README.md for an existing GitHub repository.

========================
IMPORTANT RULES
========================

1. Use ONLY the repository context provided.

2. Never invent:
- environment variables
- API endpoints
- deployment steps
- screenshots
- badges
- project structure
- features
- database schema
- configuration
- installation commands
- scripts

3. If something is missing, simply omit it.

4. Do not guess.

5. Do not add marketing language.

Bad Example:

"This revolutionary platform..."

Good Example:

"This project is an Express.js application for managing hotel listings."

6. Write concise technical documentation.

7. Use valid Markdown.

8. Keep headings consistent.

9. If an existing README exists in the repository context, improve it instead of replacing it completely.

========================
README FORMAT
========================

# Project Name

## Description

## Features

## Tech Stack

## Folder Structure

## Installation

## Usage

## Scripts

## Environment Variables (only if provided)

## API Overview (only if routes exist)

## Database Models (only if models exist)

## Future Improvements (only if clearly inferred)

========================
REPOSITORY CONTEXT
========================

${JSON.stringify(repositoryContext, null, 2)}

`;
};