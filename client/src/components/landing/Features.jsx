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
        <section id="features" className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
                        Any repository.<br />
                        <span className="text-muted-foreground">Documented on every commit.</span>
                    </h2>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Continuous documentation engine built for developer speed and accuracy.
                    </p>
                </div>

                {/* Polar 6-Bento Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {BENTO_CARDS.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Card key={idx} className="bg-card/60 border-border shadow-none hover:border-foreground/20 transition-all group">
                                <CardContent className="p-6">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 transition-colors">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Polar-style Starburst Canvas SVG Graphic */}
                <div className="relative py-16 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
                    </div>
                    
                    <svg width="320" height="320" viewBox="0 0 200 200" fill="none" className="text-primary/40 animate-pulse">
                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                        <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <line x1="36" y1="36" x2="164" y2="164" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="164" y1="36" x2="36" y2="164" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                        <circle cx="100" cy="100" r="4" fill="currentColor" />
                    </svg>
                </div>

                {/* Secondary polar text block */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        Built for the shape of modern software.
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        PushDoc connects to your GitHub pipeline to parse source diffs, generate READMEs, and push pull requests automatically.
                    </p>
                </div>
            </div>
        </section>
    );
}
