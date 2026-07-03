export const detectFramework = (dependencies = {}) => {

    const FRAMEWORKS = {
        express: "Express",
        react: "React",
        next: "Next.js",
        "@nestjs/core": "NestJS",
        vue: "Vue.js",
        angular: "Angular",
        fastify: "Fastify",
        hono: "Hono",
        astro: "Astro",
        remix: "Remix",
        svelte: "Svelte",
    };

    for (const dependency of Object.keys(dependencies)) {

        if (FRAMEWORKS[dependency]) {
            return FRAMEWORKS[dependency];
        }

    }

    return "Unknown";

};