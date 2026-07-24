import React, { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Webhook, Code2, GitCommit, Sparkles, Check, Copy } from "lucide-react";

export default function Hero({ handleLoginRedirect, setPage }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-background text-foreground">
            {/* Polar-style top glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] pointer-events-none -z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Announcement pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs mb-8 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <span className="text-foreground font-medium">Introducing PushDoc 2.0</span>
                    <span className="text-muted-foreground">• The Developer Documentation Platform</span>
                </div>

                {/* Polar-style Main Title */}
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.05] text-balance">
                    Turn Commits<br />
                    <span className="text-muted-foreground">Into Documentation</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed text-balance">
                    An AI-powered documentation engine for developers. Automate your READMEs directly from Git.
                </p>

                {/* Buttons & Command pill */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-semibold rounded-full px-8 h-12 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                    >
                        <Github className="h-4 w-4" />
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 bg-card border border-border rounded-full px-5 h-12 font-mono text-xs text-foreground shadow-sm">
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

                {/* 3 Polar-style Showcase Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 text-left">
                    <Card className="bg-card/70 border-border shadow-none hover:border-primary/40 transition-all group">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 transition-colors">
                                <Webhook className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Zero-Config Webhooks</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Fires automatically on git push events with sub-7ms payload parsing and HMAC verification.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/70 border-border shadow-none hover:border-primary/40 transition-all group">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 transition-colors">
                                <Code2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">AST Fact Extraction</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Deterministically parses Express routes, Mongoose schemas, and APIs before AI prompt synthesis.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/70 border-border shadow-none hover:border-primary/40 transition-all group">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4 border border-border group-hover:border-primary/50 transition-colors">
                                <GitCommit className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Auto README Sync</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Commits clean, structured README markdown directly back to your default branch or pull request.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
