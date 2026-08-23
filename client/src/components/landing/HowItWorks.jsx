import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { Accordion, AccordionItem } from "../ui/accordion.jsx";
import { CheckCircle2, HelpCircle, Code2, GitCommit, FileText } from "lucide-react";

const ACCURATE_FAQS = [
    {
        q: "How does PushDoc prevent AI hallucinations in generated READMEs?",
        a: "PushDoc runs an AST (Abstract Syntax Tree) fact extraction engine powered by @babel/parser. Before calling AI models, it deterministically extracts raw Express/Fastify route strings, HTTP methods, and database schemas directly from your code AST so the AI is grounded in 100% verified facts.",
    },
    {
        q: "Which AI models power the documentation engine?",
        a: "PushDoc uses primary routing to Google Gemini 2.5 Flash for high-speed documentation synthesis, with automated failover to Groq Llama 3.3 to guarantee 99.99% uptime during provider outages.",
    },
    {
        q: "How are GitHub Webhooks secured?",
        a: "Every incoming GitHub push webhook is verified using cryptographic HMAC SHA-256 signatures before processing. Unauthenticated payloads are rejected at the edge within sub-7ms.",
    },
    {
        q: "Does PushDoc store my private repository source code?",
        a: "No. PushDoc operates under a zero-code-retention policy. Diff payloads are shallow-cloned into volatile memory during active scan jobs and purged immediately after generating the README documentation artifact.",
    },
    {
        q: "Can I trigger documentation builds manually without a git push?",
        a: "Yes! You can trigger manual repository scans anytime directly from your PushDoc Dashboard or Repository Detail page with live real-time pipeline progress tracking.",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-16">

                {/* Pipeline Mechanics */}
                <div id="architecture" className="space-y-6">
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5">
                            Pipeline Architecture
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                            See PushDoc in action
                        </h2>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Every commit is parsed for route endpoints, schemas, and README updates in real time.
                        </p>
                    </div>

                    <Card className="bg-surface rounded-[6px] overflow-hidden">
                        <Tabs defaultValue="commit" className="w-full">
                            <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-accent" />
                                    <span className="text-xs font-mono text-text-secondary">PushDoc Execution Pipeline</span>
                                </div>
                                <TabsList className="bg-bg h-7 p-0.5">
                                    <TabsTrigger value="commit" className="text-xs px-2.5 h-6 gap-1.5 font-sans">
                                        <GitCommit className="h-3 w-3" /> 1. Git Push
                                    </TabsTrigger>
                                    <TabsTrigger value="ast" className="text-xs px-2.5 h-6 gap-1.5 font-sans">
                                        <Code2 className="h-3 w-3" /> 2. AST Facts
                                    </TabsTrigger>
                                    <TabsTrigger value="readme" className="text-xs px-2.5 h-6 gap-1.5 font-sans">
                                        <FileText className="h-3 w-3" /> 3. README Commit
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-4 font-mono text-xs">
                                <TabsContent value="commit" className="mt-0 space-y-1.5">
                                    <div className="text-text-secondary">$ git commit -m "feat: add user authentication & login"</div>
                                    <div className="text-text-secondary">$ git push origin main</div>
                                    <div className="text-success font-semibold pt-1">
                                        ✓ Webhook dispatched to api.pushdoc.io (Latency: 6.4ms)
                                    </div>
                                </TabsContent>

                                <TabsContent value="ast" className="mt-0 space-y-1.5">
                                    <div className="text-accent font-semibold">// AST Fact Extraction Engine (@babel/parser)</div>
                                    <div className="text-text-secondary">• Route Detected: POST /auth/login</div>
                                    <div className="text-text-secondary">• Route Detected: POST /auth/register</div>
                                    <div className="text-text-secondary">• Schema Model: User (email, passwordHash, role)</div>
                                    <div className="text-success font-semibold pt-1">
                                        ✓ Extraction verified 100% ground-truth deterministic
                                    </div>
                                </TabsContent>

                                <TabsContent value="readme" className="mt-0 space-y-2 font-sans text-xs">
                                    <div className="font-semibold text-sm border-b border-border pb-1.5 text-text-primary">Auth Module Reference</div>
                                    <p className="text-text-secondary text-xs leading-relaxed">
                                        Authentication controller handling user registration and token generation.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-success text-xs font-medium pt-1 font-mono">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Directly committed back to repository origin/main</span>
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>

                {/* FAQ */}
                <div id="faq" className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="text-xs font-mono gap-1 rounded-[4px] px-2.5">
                            <HelpCircle className="h-3 w-3 text-accent" /> FAQ
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <Accordion className="rounded-[6px] bg-surface-raised divide-y divide-border">
                        {ACCURATE_FAQS.map((faq, idx) => (
                            <AccordionItem key={idx} value={`faq-${idx}`} title={faq.q}>
                                {faq.a}
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
