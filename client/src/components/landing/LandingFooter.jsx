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
        <footer className="bg-background border-t border-border relative">
            {/* Dark CTA Banner with Polar Glow */}
            <div className="py-24 px-6 text-center max-w-4xl mx-auto relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-0" />
                
                <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl text-balance leading-tight">
                    Ready to automate your repository documentation?
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
                    Connect your GitHub repository in 30 seconds. PushDoc handles README updates automatically on every commit.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-semibold shadow-md rounded-full px-8 h-12 text-sm"
                    >
                        <Github className="h-4 w-4" />
                        <span>Get Started Free</span>
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
            </div>

            <Separator />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    <PushDocLogo />
                    <span className="text-muted-foreground ml-2">© {year} PushDoc. All rights reserved.</span>
                </div>

                <div className="flex items-center gap-6">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                        <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
