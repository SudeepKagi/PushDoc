import React, { useState } from "react";
import { PushDocLogo } from "../ui/PushDocLogo.jsx";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Copy, Check } from "lucide-react";

export default function LandingFooter({ setPage, handleLoginRedirect }) {
    const year = new Date().getFullYear();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("npx pushdoc@latest sync");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <footer className="bg-bg border-t border-border relative text-text-primary font-sans">
            {/* CTA Banner */}
            <div className="py-16 px-6 text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary leading-tight">
                    Everything you need to stop writing docs.
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                    Connect your GitHub repository in 30 seconds. PushDoc handles README updates automatically on every commit.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-medium rounded-[6px] px-6 h-10 text-sm"
                    >
                        <Github className="h-4 w-4" />
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 bg-surface-raised rounded-[6px] px-4 h-10 font-mono text-xs text-text-primary">
                        <span className="text-accent font-semibold">$</span>
                        <span>npx pushdoc@latest sync</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-text-muted hover:text-text-primary ml-1"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Footer links */}
            <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-text-secondary">
                <div className="col-span-2 space-y-3">
                    <PushDocLogo />
                    <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                        Automated AI documentation platform for software developers and engineering teams.
                    </p>
                    <p className="text-xs text-text-muted font-mono">
                        © {year} PushDoc. All rights reserved.
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="font-semibold text-text-primary text-xs uppercase font-mono tracking-wider">Product</div>
                    <ul className="space-y-1.5">
                        <li><a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                        <li><a href="#architecture" className="text-text-secondary hover:text-text-primary transition-colors">AST Engine</a></li>
                        <li><a href="#integrations" className="text-text-secondary hover:text-text-primary transition-colors">Ecosystem</a></li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <div className="font-semibold text-text-primary text-xs uppercase font-mono tracking-wider">Resources</div>
                    <ul className="space-y-1.5">
                        <li><a href="#security" className="text-text-secondary hover:text-text-primary transition-colors">Security & Privacy</a></li>
                        <li><a href="#faq" className="text-text-secondary hover:text-text-primary transition-colors">FAQ</a></li>
                        <li><a href="https://pushdoc-api.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">API Status</a></li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <div className="font-semibold text-text-primary text-xs uppercase font-mono tracking-wider">Company</div>
                    <ul className="space-y-1.5">
                        <li><a href="https://github.com/SudeepKagi/PushDoc" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">GitHub Repository</a></li>
                        <li><a href="#security" className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</a></li>
                        <li><a href="#security" className="text-text-secondary hover:text-text-primary transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
