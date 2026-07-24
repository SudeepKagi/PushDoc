import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Accordion, AccordionItem } from "../ui/accordion.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { Zap, FileText, CheckCircle2, HelpCircle } from "lucide-react";

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

const FAQS = [
    {
        q: "How does PushDoc prevent AI hallucinations in documentation?",
        a: "PushDoc uses an AST (Abstract Syntax Tree) fact extraction engine built with @babel/parser. It deterministically extracts route URL strings, HTTP methods, and database schema fields directly from raw code AST before giving the prompt context to AI models.",
    },
    {
        q: "Does PushDoc store or clone my entire repository?",
        a: "No. PushDoc only shallow-clones diffs during active webhook execution. Code contents are processed in memory and discarded immediately after generating the README documentation artifact.",
    },
    {
        q: "What access scopes are required on GitHub?",
        a: "PushDoc requires read access to repository contents (to parse routes/models) and write access restricted strictly to README files and commit dispatching.",
    },
    {
        q: "Can I customize which files or routes are included in the generated README?",
        a: "Yes! Through the PushDoc Settings tab, you can toggle individual analyzers (Route Analyzer, Model Analyzer, Controller Analyzer) and set output branch paths.",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-muted/30 border-t border-b border-border">
            <div className="max-w-7xl mx-auto px-6 space-y-24">
                {/* How It Works Steps */}
                <div>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Badge variant="outline" className="mb-3 text-xs font-normal rounded-full px-3">
                            Step-by-Step
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            How PushDoc Works
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Fully automated documentation pipeline connected directly to your GitHub repository.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s) => {
                            const Icon = s.icon;
                            return (
                                <Card key={s.num} className="shadow-none border-border bg-card">
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
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
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
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

                {/* Polar-style FAQ Accordion */}
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <Badge variant="outline" className="mb-3 text-xs font-normal gap-1 rounded-full px-3">
                            <HelpCircle className="h-3.5 w-3.5 text-primary" /> FAQ
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <Accordion>
                        {FAQS.map((faq, idx) => (
                            <AccordionItem key={idx} title={faq.q} defaultOpen={idx === 0}>
                                {faq.a}
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
