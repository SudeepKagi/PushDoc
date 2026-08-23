import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Cpu, Server, Database, GitBranch, Sparkles, Shield, Code, Workflow } from "lucide-react";

const STACK = [
    { name: "Express.js", cat: "Backend AST", icon: Server, desc: "Parses route handlers, middleware, & URL params." },
    { name: "Fastify", cat: "Backend AST", icon: Code, desc: "Extracts JSON schema routes & controller functions." },
    { name: "Mongoose", cat: "Data Models", icon: Database, desc: "Extracts MongoDB schemas, types, & field validation." },
    { name: "Prisma ORM", cat: "Data Models", icon: Database, desc: "Parses schema.prisma definitions & relations." },
    { name: "GitHub Webhooks", cat: "Git Engine", icon: GitBranch, desc: "Sub-7ms HMAC signature verification on git push." },
    { name: "Gemini 2.5 Flash", cat: "AI Provider", icon: Sparkles, desc: "High-speed LLM for structured Markdown synthesis." },
    { name: "Groq Llama 3.3", cat: "AI Failover", icon: Cpu, desc: "Ultra-low latency backup provider for 99.99% uptime." },
    { name: "Shields.io", cat: "Badges", icon: Shield, desc: "Validates package dependencies for live badges." },
];

export default function Integrations() {
    return (
        <section id="integrations" className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5 gap-1">
                        <Workflow className="h-3 w-3 text-accent" /> Supported Ecosystem
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Works with your entire stack
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        PushDoc plugs directly into your backend frameworks, database ORMs, and AI providers.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STACK.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Card key={idx} className="bg-surface-raised rounded-[6px] transition-colors">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary">
                                            <Icon className="h-4 w-4 text-accent" />
                                        </div>
                                        <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">
                                            {item.cat}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-primary">{item.name}</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {item.desc}
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
