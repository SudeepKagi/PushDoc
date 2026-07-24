import React, { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Webhook, Code2, GitCommit, Sparkles, Check, Copy, Zap, Terminal } from "lucide-react";

export default function Hero({ handleLoginRedirect, setPage }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative pt-36 pb-24 overflow-hidden bg-background text-foreground">
            {/* Animated Motion Gradient Glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-[140px] pointer-events-none -z-0 animate-pulse" />
            <div className="absolute top-24 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-0" />
            <div className="absolute top-36 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Announcement pill with pulse animation */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/70 backdrop-blur-md text-xs mb-8 shadow-sm transition-transform hover:scale-105">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
                    <span className="text-foreground font-semibold">Introducing PushDoc 2.0</span>
                    <span className="text-muted-foreground font-normal">• Autonomous AI Documentation Engine</span>
                </div>

                {/* Inspiring Motion Headline */}
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-foreground max-w-5xl mx-auto leading-[1.04] text-balance">
                    Autonomous READMEs<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-muted-foreground to-foreground/60 animate-gradient">
                        Engineered from Your Code
                    </span>
                </h1>

                {/* Clear Subtitle explaining exact functionality */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-7 leading-relaxed text-balance font-normal">
                    PushDoc extracts Express routes, database schemas, and git diffs on every commit—generating 100% accurate README documentation automatically.
                </p>

                {/* Interactive CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2.5 font-semibold rounded-full px-8 h-12 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        <Github className="h-4 w-4" />
                        <span>Connect Repository</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 bg-card/80 border border-border/80 backdrop-blur-md rounded-full px-5 h-12 font-mono text-xs text-foreground shadow-sm hover:border-primary/50 transition-all">
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

                {/* 3 Interactive Showcase Cards with Motion hover effects */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 text-left">
                    <Card className="bg-card/60 border-border/80 backdrop-blur-md shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group">
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

                    <Card className="bg-card/60 border-border/80 backdrop-blur-md shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group">
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

                    <Card className="bg-card/60 border-border/80 backdrop-blur-md shadow-none hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group">
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
