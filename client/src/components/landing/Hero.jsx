import React from "react";
import LOGO_BASE64 from "../../logoBase64.js";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { Zap, FileText, ArrowRight, Sparkles } from "lucide-react";
import { GithubIcon as Github } from "../ui/GithubIcon.jsx";


const STEPS = [
    {
        num: "1",
        icon: Github,
        title: "Connect Repo",
        desc: "Link your GitHub repository in one click",
    },
    {
        num: "2",
        icon: Zap,
        title: "Push Code",
        desc: "Code & commit as you normally do",
    },
    {
        num: "3",
        icon: FileText,
        title: "README Auto-Syncs",
        desc: "PushDoc analyzes diffs & updates docs",
    },
];

export default function Hero({ handleLoginRedirect, setPage }) {
    return (
        <section id="hero" className="relative pt-32 pb-20 overflow-hidden bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Badge pill */}
                <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-normal gap-1.5 border border-border shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>AI-Powered Automated README Generation</span>
                </Badge>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
                    Docs written by your code, updated on every push.
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
                    PushDoc automatically analyzes your repository diffs, extracts API endpoints, routes, and features, and commits polished README files directly to GitHub.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-medium shadow-sm rounded-full px-8 h-11"
                    >
                        <span>Start Free with GitHub</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setPage("onboarding")}
                        className="rounded-full px-8 h-11 text-muted-foreground hover:text-foreground"
                    >
                        How It Works
                    </Button>
                </div>

                {/* Step cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 text-left">
                    {STEPS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.num} className="shadow-none border-border bg-card/60">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-foreground font-semibold shrink-0 border border-border">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground tracking-tight">{s.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 leading-normal">{s.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
