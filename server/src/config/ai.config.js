import * as geminiProvider from "../providers/gemini.provider.js";
import * as groqProvider from "../providers/groq.provider.js";

export const AI_PROVIDERS = [

    {
        name: "Gemini",

        priority: 1,

        enabled: true,

        model: "gemini-2.5-flash",

        provider: geminiProvider,

        apiKeys: [

            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,

        ].filter(Boolean),

    },

    {
        name: "Groq",

        priority: 2,

        enabled: true,

        model: "llama-3.3-70b-versatile",

        provider: groqProvider,

        apiKeys: [

            process.env.GROQ_API_KEY_1,
            process.env.GROQ_API_KEY_2,

        ].filter(Boolean),

    },

];