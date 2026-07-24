import React, { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Webhook, Code2, GitCommit, Sparkles, Check, Copy, CheckCircle2, FileText, Terminal, Zap } from "lucide-react";

export default function Hero({ handleLoginRedirect, setPage }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative pt-36 pb-28 overflow-hidden bg-background text-foreground">
            {/* Godly.website Motion Graphics: Animated Mesh Grid & Glowing Gradient Orbs */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-0 opacity-70" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-[150px] pointer-events-none -z-0 animate-pulse" />
            <div className="absolute top-32 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-0" />
            <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none -z-0" />

            {/* Constellation Particle Vector Graphics */}
            <div className="absolute top-20 right-12 pointer-events-none opacity-20 hidden lg:block animate-pulse">
                <svg width="240" height="240" viewBox="0 0 200 200" fill="none" className="text-primary">
                    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                    <circle cx="100" cy="20" r="3" fill="currentColor" />
                    <circle cx="180" cy="100" r="3" fill="currentColor" />
                    <circle cx="100" cy="180" r="3" fill="currentColor" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Godly Live Pulse Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/30 bg-card/80 backdrop-blur-xl text-xs mb-8 shadow-lg transition-all transform hover:scale-105">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-foreground font-semibold">Introducing PushDoc 2.0</span>
                    <span className="text-muted-foreground font-normal">• The Autonomous Documentation Platform</span>
                </div>

                {/* Godly Headline Copy */}
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-foreground max-w-5xl mx-auto leading-[1.04] text-balance">
                    Your Codebase.<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-muted-foreground to-foreground/60 animate-gradient">
                        Documented on Every Commit.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-7 leading-relaxed text-balance font-normal">
                    An AI-powered documentation engine that parses raw AST facts into clean, production-ready READMEs directly from Git.
                </p>

                {/* Interactive Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2.5 font-semibold rounded-full px-8 h-12 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-2xl transition-all transform hover:-translate-y-0.5"
                    >
                        <Github className="h-4 w-4" />
                        <span>Connect Repository</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 bg-card/80 border border-border/80 backdrop-blur-xl rounded-full px-5 h-12 font-mono text-xs text-foreground shadow-sm hover:border-primary/50 transition-all">
                        <span className="text-primary">$</span>
                        <span className="tracking-tight">npx pushdoc@latest sync</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>

                {/* Godly Motion Mockup Card: Live Pipeline Execution Tabbed Window */}
                <div className="mt-16 max-w-4xl mx-auto text-left">
                    <Card className="shadow-2xl border-border/80 bg-card/90 backdrop-blur-xl overflow-hidden rounded-2xl">
                        <Tabs defaultValue="commit" className="w-full">
                            <CardHeader className="p-4 pb-3 border-b border-border/80 bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5 mr-2">
                                        <div className="h-3 w-3 rounded-full bg-destructive/60" />
                                        <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                                        <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">sudeepkagi/PushDoc — main</span>
                                </div>
                                <TabsList className="bg-muted h-8 p-0.5">
                                    <TabsTrigger value="commit" className="text-xs px-3 h-7 gap-1.5">
                                        <GitCommit className="h-3.5 w-3.5" /> 1. Git Push
                                    </TabsTrigger>
                                    <TabsTrigger value="ast" className="text-xs px-3 h-7 gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" /> 2. AST Fact Extraction
                                    </TabsTrigger>
                                    <TabsTrigger value="readme" className="text-xs px-3 h-7 gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> 3. README Commit
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-6 font-mono text-xs">
                                <TabsContent value="commit" className="mt-0 space-y-2">
                                    <div className="text-muted-foreground">$ git commit -m "feat: add user authentication & login routes"</div>
                                    <div className="text-muted-foreground">$ git push origin main</div>
                                    <div className="text-emerald-500 font-semibold pt-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Webhook dispatched to api.pushdoc.io (Latency: 6.4ms)</span>
                                    </div>
                                </TabsContent>

                                <TabsContent value="ast" className="mt-0 space-y-2">
                                    <div className="text-primary font-semibold">// AST Fact Extraction Engine (@babel/parser)</div>
                                    <div className="text-muted-foreground">• Route Detected: POST /auth/login</div>
                                    <div className="text-muted-foreground">• Route Detected: POST /auth/register</div>
                                    <div className="text-muted-foreground">• Schema Model: User (email, passwordHash, role)</div>
                                    <div className="text-emerald-500 font-semibold pt-1 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Extraction verified 100% ground-truth deterministic</span>
                                    </div>
                                </TabsContent>

                                <TabsContent value="readme" className="mt-0 space-y-3 font-sans text-xs">
                                    <div className="font-bold text-base border-b border-border pb-2 text-foreground">🖼️ Auth Module Documentation</div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        Authentication controller handling user registration, token generation, and role authorization.
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

                {/* Godly 3-Bento Card Showcase Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 text-left">
                    <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group rounded-xl">
                        <CardContent className="p-6">
                            <div className="h-11 w-11 rounded-xl bg-muted/80 flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <Webhook className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Zero-Config Webhooks</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Fires automatically on git push events with sub-7ms payload parsing and HMAC cryptographic verification.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group rounded-xl">
                        <CardContent className="p-6">
                            <div className="h-11 w-11 rounded-xl bg-muted/80 flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <Code2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">AST Fact Extraction</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Deterministically parses Express routes, Mongoose schemas, and APIs before AI prompt synthesis to prevent hallucinations.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group rounded-xl">
                        <CardContent className="p-6">
                            <div className="h-11 w-11 rounded-xl bg-muted/80 flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <GitCommit className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Auto README Sync</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Commits clean, structured README markdown directly back to your default branch or pull request automatically.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
