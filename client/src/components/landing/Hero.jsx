import React, { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { Sparkles, ArrowRight, Copy, Check, Terminal, Code2, FileText, GitCommit, CheckCircle2 } from "lucide-react";

export default function Hero({ handleLoginRedirect, setPage }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative pt-28 pb-20 overflow-hidden bg-background">
            {/* Subtle background glow effect */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Announcement pill badge */}
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-normal gap-2 border-border bg-card/60 backdrop-blur-md rounded-full shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground font-medium">Introducing PushDoc 2.0</span>
                    <span className="text-muted-foreground">• AST Fact Extraction & Zero-Config Webhooks</span>
                </Badge>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] text-balance">
                    The Automated README Engine for Developers
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
                    PushDoc turns git commits, Express routes, and database models into clean, accurate developer documentation on every push — automatically.
                </p>

                {/* CTAs & Terminal Copy */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-semibold rounded-full px-8 h-12 text-sm shadow-md"
                    >
                        <Github className="h-4 w-4" />
                        <span>Connect with GitHub</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 h-12 font-mono text-xs text-foreground shadow-sm">
                        <span className="text-muted-foreground">$</span>
                        <span>npx pushdoc@latest sync</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>

                {/* Polar-style Interactive Code & Live Preview Showcase */}
                <div className="mt-16 max-w-4xl mx-auto text-left">
                    <Card className="shadow-2xl border-border bg-card/90 backdrop-blur-xl overflow-hidden">
                        <Tabs defaultValue="diff" className="w-full">
                            <CardHeader className="p-4 pb-3 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5 mr-2">
                                        <div className="h-3 w-3 rounded-full bg-destructive/60" />
                                        <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                                        <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">pushdoc-demo / main</span>
                                </div>
                                <TabsList className="bg-muted h-8 p-0.5">
                                    <TabsTrigger value="diff" className="text-xs px-3 h-7 gap-1.5">
                                        <GitCommit className="h-3.5 w-3.5" /> Git Commit Diff
                                    </TabsTrigger>
                                    <TabsTrigger value="ast" className="text-xs px-3 h-7 gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" /> AST Extraction
                                    </TabsTrigger>
                                    <TabsTrigger value="readme" className="text-xs px-3 h-7 gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> README.md Result
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-6 font-mono text-xs">
                                <TabsContent value="diff" className="mt-0 space-y-2">
                                    <div className="text-muted-foreground">// Commit #7a82bc1 - Added OAuth & Auth Controller</div>
                                    <div className="text-emerald-500/90">+ router.post('/api/auth/register', validate, authController.register);</div>
                                    <div className="text-emerald-500/90">+ router.post('/api/auth/login', authController.login);</div>
                                    <div className="text-emerald-500/90">+ const UserSchema = new Schema({"{\n email: String, role: String \n}"});</div>
                                    <div className="text-muted-foreground mt-4">// Fired Webhook: POST api.pushdoc.io/webhooks/github (7ms)</div>
                                </TabsContent>

                                <TabsContent value="ast" className="mt-0 space-y-2 text-foreground">
                                    <div className="text-primary font-semibold">// AST Fact Extraction Engine (@babel/parser)</div>
                                    <div className="text-muted-foreground">Detected Routes: 2 endpoints (POST /api/auth/register, POST /api/auth/login)</div>
                                    <div className="text-muted-foreground">Database Models: User (fields: email: String, role: String)</div>
                                    <div className="text-muted-foreground">Environment Dependencies: JWT_SECRET, MONGO_URI</div>
                                    <div className="text-emerald-500 font-semibold mt-3">✓ 100% Deterministic — Zero AI Hallucination Guarantee</div>
                                </TabsContent>

                                <TabsContent value="readme" className="mt-0 space-y-3 font-sans text-xs">
                                    <div className="font-bold text-base border-b border-border pb-2 text-foreground">🖼️ Auth Microservice</div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        High-performance authentication microservice parsing JWT sessions and MongoDB user accounts.
                                    </p>
                                    <div className="p-3 bg-muted rounded border border-border font-mono text-[11px]">
                                        <div className="font-semibold text-foreground mb-1">API Endpoints</div>
                                        <div>POST /api/auth/register — Register new account</div>
                                        <div>POST /api/auth/login — Generate JWT token</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium pt-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Committed back to GitHub origin/main</span>
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </section>
    );
}
