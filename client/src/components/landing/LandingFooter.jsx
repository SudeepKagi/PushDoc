import React, { useState } from "react";
import { PushDocLogo } from "../ui/PushDocLogo.jsx";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Copy, Check } from "lucide-react";

export default function LandingFooter({ setPage }) {
    const year = new Date().getFullYear();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <footer className="bg-background border-t border-border relative text-foreground">
            {/* Polar CTA Banner */}
            <div className="py-24 px-6 text-center max-w-4xl mx-auto relative z-10 space-y-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-0" />
                
                <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl text-balance leading-tight">
                    Everything you need to stop writing docs.
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Connect your GitHub repository in 30 seconds. PushDoc handles README updates automatically on every commit.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-semibold rounded-full px-8 h-12 text-sm bg-foreground text-background hover:bg-foreground/90 shadow-md"
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
            </div>

            <Separator />

            {/* Polar-style 4-Column Footer */}
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-muted-foreground">
                <div className="col-span-2 space-y-4">
                    <PushDocLogo />
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Automated AI documentation platform for software developers and engineering teams.
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                        © {year} PushDoc. All rights reserved.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider">Product</div>
                    <ul className="space-y-2">
                        <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                        <li><a href="#features" className="hover:text-foreground transition-colors">AST Parser</a></li>
                        <li><a href="#features" className="hover:text-foreground transition-colors">AI Routing</a></li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider">Resources</div>
                    <ul className="space-y-2">
                        <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub App</a></li>
                        <li><a href="https://pushdoc-api.onrender.com/health" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">API Status</a></li>
                        <li><a href="#features" className="hover:text-foreground transition-colors">Documentation</a></li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider">Company</div>
                    <ul className="space-y-2">
                        <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Open Source</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
