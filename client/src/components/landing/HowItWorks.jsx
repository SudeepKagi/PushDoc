import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { CheckCircle2, HelpCircle, Code2, GitCommit, FileText, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

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
    const [openIdx, setOpenIdx] = useState(0);

    return (
        <section className="py-24 bg-muted/20 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 space-y-24">

                {/* Pipeline Mechanics Showcase Block */}
                <div id="architecture" className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-3">
                        <Badge variant="outline" className="text-xs font-normal rounded-full px-3">
                            Pipeline Mechanics
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            See PushDoc in action
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Every commit is parsed for route endpoints, schemas, and README updates in real time.
                        </p>
                    </div>

                    <Card className="shadow-2xl border-border bg-card overflow-hidden">
                        <Tabs defaultValue="commit" className="w-full">
                            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5 mr-2">
                                        <div className="h-3 w-3 rounded-full bg-destructive/60" />
                                        <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                                        <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">sudeepkagi/PushDoc</span>
                                </div>
                                <TabsList className="bg-muted h-8 p-0.5">
                                    <TabsTrigger value="commit" className="text-xs px-3 h-7 gap-1.5">
                                        <GitCommit className="h-3.5 w-3.5" /> 1. Git Push
                                    </TabsTrigger>
                                    <TabsTrigger value="ast" className="text-xs px-3 h-7 gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" /> 2. AST Extraction
                                    </TabsTrigger>
                                    <TabsTrigger value="readme" className="text-xs px-3 h-7 gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> 3. README Commit
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-6 font-mono text-xs">
                                <TabsContent value="commit" className="mt-0 space-y-2">
                                    <div className="text-muted-foreground">$ git commit -m "feat: add user authentication & login"</div>
                                    <div className="text-muted-foreground">$ git push origin main</div>
                                    <div className="text-emerald-500 font-semibold pt-2">
                                        ✓ Webhook dispatched to api.pushdoc.io (Latency: 6.4ms)
                                    </div>
                                </TabsContent>

                                <TabsContent value="ast" className="mt-0 space-y-2">
                                    <div className="text-primary font-semibold">// AST Fact Extraction Engine (@babel/parser)</div>
                                    <div className="text-muted-foreground">• Route Detected: POST /auth/login</div>
                                    <div className="text-muted-foreground">• Route Detected: POST /auth/register</div>
                                    <div className="text-muted-foreground">• Schema Model: User (email, passwordHash, role)</div>
                                    <div className="text-emerald-500 font-semibold pt-1">
                                        ✓ Extraction verified 100% ground-truth deterministic
                                    </div>
                                </TabsContent>

                                <TabsContent value="readme" className="mt-0 space-y-3 font-sans text-xs">
                                    <div className="font-bold text-base border-b border-border pb-2 text-foreground">🖼️ Auth Module</div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        Authentication controller handling user registration and token generation.
                                    </p>
                                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium pt-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Directly committed back to repository origin/main</span>
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>

                {/* Accurate Interactive Collapsible FAQ */}
                <div id="faq" className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="text-xs font-normal gap-1 rounded-full px-3">
                            <HelpCircle className="h-3.5 w-3.5 text-primary" /> FAQ
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
                        {ACCURATE_FAQS.map((faq, idx) => {
                            const isOpen = openIdx === idx;
                            return (
                                <div key={idx} className="border-b border-border last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                                        className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-foreground transition-all hover:bg-muted/50"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ml-2", isOpen && "rotate-180")} />
                                    </button>
                                    {isOpen && (
                                        <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
