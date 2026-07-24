import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Webhook, Cpu, GitCommit, ShieldCheck, Zap, Code2, Sparkles, Terminal } from "lucide-react";

export default function Features() {
    return (
        <section id="features" className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="outline" className="mb-3 text-xs font-normal rounded-full px-3">
                        Engine Architecture
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Built for modern developer workflows
                    </h2>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        Deterministic AST extraction combined with AI synthesis for automated, zero-maintenance documentation.
                    </p>
                </div>

                {/* Polar-style Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Webhook Engine (Span 2) */}
                    <Card className="md:col-span-2 shadow-none border-border bg-card/60 hover:bg-card/90 transition-all">
                        <CardHeader className="p-6 pb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 border border-primary/20">
                                <Webhook className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Zero-Config Webhook Listener</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Listen for git push events with HMAC-SHA256 payload verification and sub-7ms dispatch latency.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 font-mono text-xs">
                            <div className="p-4 bg-muted rounded-md border border-border space-y-1.5 text-muted-foreground">
                                <div><span className="text-emerald-500 font-semibold">POST</span> /webhooks/github — 202 Accepted</div>
                                <div className="text-[11px]">Header: X-Hub-Signature-256: sha256=9f82ab...</div>
                                <div className="text-foreground text-[11px] font-semibold pt-1">✓ Triggered README pipeline worker in background</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: AST Fact Extraction (Span 1) */}
                    <Card className="shadow-none border-border bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between">
                        <CardHeader className="p-6 pb-2">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                                <Code2 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">AST Fact Extraction</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Uses @babel/parser to extract real Express routes, Fastify endpoints, and Prisma schemas without guessing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <Badge variant="success" className="text-xs font-mono font-normal">
                                Zero Hallucination
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Card 3: AI Failover Routing (Span 1) */}
                    <Card className="shadow-none border-border bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between">
                        <CardHeader className="p-6 pb-2">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20">
                                <Zap className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">AI Failover Routing</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Automatic failover between Gemini 2.5 Flash and Groq Llama 3.3 for 99.99% pipeline uptime.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <Badge variant="outline" className="text-xs font-mono font-normal gap-1">
                                <Sparkles className="h-3 w-3 text-amber-500" /> Auto-Switching
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Card 4: Direct Git Commits (Span 2) */}
                    <Card className="md:col-span-2 shadow-none border-border bg-card/60 hover:bg-card/90 transition-all">
                        <CardHeader className="p-6 pb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 border border-primary/20">
                                <GitCommit className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-bold">Automated README Commits</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Direct commit or pull request creation directly back into your default GitHub branch with customized markdown badges.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 font-mono text-xs">
                            <div className="p-3 bg-muted rounded-md border border-border flex items-center justify-between text-muted-foreground">
                                <span>git commit -m "docs: auto-update README via PushDoc"</span>
                                <Badge variant="secondary" className="text-[10px] font-mono">PUSHED</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
