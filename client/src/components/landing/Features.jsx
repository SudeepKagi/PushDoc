import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Route, Database, ShieldCheck, Zap, Shield, Sparkles } from "lucide-react";

const BENTO_CARDS = [
    {
        icon: Route,
        title: "Express & Fastify Routes",
        desc: "Automatically extracts URL parameters, HTTP methods, and middleware chains from your source code AST.",
    },
    {
        icon: Database,
        title: "Database Models",
        desc: "Parses Mongoose schemas, Prisma definitions, and Sequelize models to generate accurate data structures.",
    },
    {
        icon: ShieldCheck,
        title: "Environment Schemas",
        desc: "Identifies process.env dependencies and .env.example keys to document required environment variables.",
    },
    {
        icon: Zap,
        title: "Multi-Model Failover",
        desc: "Automated routing between Gemini 2.5 Flash and Groq Llama 3.3 to guarantee 99.99% pipeline availability.",
    },
    {
        icon: Shield,
        title: "Shields.io Badges",
        desc: "Audits package.json dependencies to generate confirmed Shields.io tech badges without dead links.",
    },
    {
        icon: Sparkles,
        title: "Zero Hallucination",
        desc: "Grounded strictly in static analysis facts before prompt compilation so documentation never invents code.",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Any repository. Documented on every commit.
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Continuous documentation engine built for developer speed and accuracy.
                    </p>
                </div>

                {/* 6-Bento Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BENTO_CARDS.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Card key={idx} className="bg-surface-raised rounded-[6px] transition-colors">
                                <CardContent className="p-4 space-y-2">
                                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary mb-2">
                                        <Icon className="h-4 w-4 text-accent" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-primary">{card.title}</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {card.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
