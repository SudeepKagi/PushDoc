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
        <section id="integrations" className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6 space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <Badge variant="outline" className="text-xs font-normal rounded-full px-3 gap-1">
                        <Workflow className="h-3.5 w-3.5 text-primary" /> Supported Ecosystem
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
                        Works with your entire stack
                    </h2>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        PushDoc plugs directly into your backend frameworks, database ORMs, and AI providers.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {STACK.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Card key={idx} className="bg-card/70 border-border shadow-none hover:border-primary/40 transition-all group">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground border border-border group-hover:border-primary/40 transition-colors">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                                            {item.cat}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
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
