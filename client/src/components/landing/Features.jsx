import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Cpu, Webhook, ShieldCheck, Route, FileCode, Sparkles } from "lucide-react";

const FEATURES = [
    {
        icon: Cpu,
        title: "Intelligent Code Analysis",
        desc: "Powered by Gemini & Groq models, our AST engine deeply understands your codebase structure, logic, and routes to generate human-quality documentation.",
    },
    {
        icon: Webhook,
        title: "Real-time Webhook Integration",
        desc: "Push once, sync forever. We listen for git push events in real-time, ensuring your README is never out of date.",
    },
    {
        icon: ShieldCheck,
        title: "Enterprise-Grade Security",
        desc: "Your code stays yours. All GitHub tokens and repository access keys are protected with AES-256 encryption at rest and in transit.",
    },
];

const CAPABILITIES = [
    { icon: Route, label: "AST Route Parsing", desc: "Extracts Express, FastAPI, and React API endpoints deterministically." },
    { icon: FileCode, label: "Markdown Formatting", desc: "Generates clean badges, table-of-contents, tech tables, and code snippets." },
    { icon: Sparkles, label: "Failover Key Routing", desc: "Automated routing between Gemini and Groq to maintain high availability." },
];

export default function Features() {
    return (
        <section id="features" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="outline" className="mb-3 text-xs font-normal">Platform Features</Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Built for modern developer workflows</h2>
                    <p className="text-sm text-muted-foreground mt-2">Zero configuration required. Push code and let AI handle documentation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <Card key={f.title} className="shadow-none border-border">
                                <CardHeader className="p-6 pb-2">
                                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center text-foreground mb-3 border border-border">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">{f.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-2">
                                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                                        {f.desc}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div id="capabilities" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
                    {CAPABILITIES.map((c) => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border mt-0.5">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-foreground">{c.label}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
