import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Zap, FileText } from "lucide-react";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";


const STEPS = [
    {
        num: "01",
        icon: Github,
        title: "Install the GitHub App",
        desc: "Authorize PushDoc on your GitHub organization in one click. Scopes read access to code and write-only access for README commits.",
        bullets: [
            "Read access: repository contents",
            "Write access: README.md commits",
            "Webhook: push event listener",
        ],
    },
    {
        num: "02",
        icon: Zap,
        title: "Push Code as Usual",
        desc: "Every git push fires an instant webhook. Analyzers extract Express routes, database models, and components in real time.",
        bullets: [
            "Analyzes route endpoints & AST",
            "Detects Mongoose / Prisma schemas",
            "Context fed into Gemini / Groq",
        ],
    },
    {
        num: "03",
        icon: FileText,
        title: "README Committed Back",
        desc: "A clean, structured README is generated and committed directly back to your branch with zero manual effort.",
        bullets: [
            "Direct commit back to branch",
            "Formatted tables & badges",
            "Never goes out of date",
        ],
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 bg-muted/40 border-t border-b border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="outline" className="mb-3 text-xs font-normal">Step-by-Step</Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">How PushDoc Works</h2>
                    <p className="text-sm text-muted-foreground mt-2">Fully automated documentation engine connected to your GitHub pipeline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.num} className="shadow-none border-border bg-card">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-foreground font-semibold border border-border">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-mono text-xs font-bold text-muted-foreground">{s.num}</span>
                                    </div>
                                    <CardTitle className="text-base font-semibold">{s.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-2 space-y-4">
                                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                                        {s.desc}
                                    </CardDescription>

                                    <div className="p-3 bg-muted rounded-md space-y-1.5 font-mono text-[11px] text-muted-foreground border border-border">
                                        {s.bullets.map((b, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
