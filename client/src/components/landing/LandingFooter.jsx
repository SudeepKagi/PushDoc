import React from "react";
import LOGO_BASE64 from "../../logoBase64.js";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { ArrowRight } from "lucide-react";
import { GithubIcon as Github } from "../ui/GithubIcon.jsx";


export default function LandingFooter({ setPage }) {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-background border-t border-border">
            {/* CTA Banner */}
            <div className="py-20 px-6 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Ready to stop writing docs manually?
                </h2>
                <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
                    Connect your GitHub repository in 30 seconds. PushDoc handles README updates automatically on every push.
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-medium shadow-sm rounded-full px-8"
                    >
                        <Github className="h-4 w-4" />
                        <span>Get Started Free</span>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <img src={LOGO_BASE64} alt="PushDoc" className="h-5 w-auto" />
                    <span className="font-semibold text-foreground">PushDoc</span>
                    <span>© {year} All rights reserved.</span>
                </div>

                <div className="flex items-center gap-6">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
                </div>
            </div>
        </footer>
    );
}
