import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Check, ChevronRight, ArrowRight } from "lucide-react";

const STEPS = [
    {
        id: 1,
        title: "Docs written by your commits.",
        desc: "PushDoc hooks into your GitHub workflow. Every push triggers an AI pipeline that reads your code and writes your README — automatically.",
        label: "HOW IT WORKS",
    },
    {
        id: 2,
        title: "Webhook fires in milliseconds.",
        desc: "A secure, encrypted webhook POST is dispatched to api.pushdoc.io with zero-latency overhead — < 7ms payload parsing with HMAC-SHA256 verification.",
        label: "WEBHOOK LISTENER",
    },
    {
        id: 3,
        title: "Deep workspace analysis.",
        desc: "Our engine clones the push diff, parses Express routes, Mongoose schemas, and compiles context blocks for the AI layer.",
        label: "AST ANALYZER",
    },
    {
        id: 4,
        title: "AI synthesizes context.",
        desc: "The code structure is fed into Gemini 2.5 Flash. Failover logic shifts queries to Groq if latency exceeds 1.5 seconds.",
        label: "AI GENERATION",
    },
    {
        id: 5,
        title: "README committed back.",
        desc: "PushDoc generates clean, structured documentation and pushes a direct commit or pull request back into your branch.",
        label: "SYNC COMPLETE",
    },
];

export default function OnboardingPage({ handleLoginRedirect, setPage }) {
    const [step, setStep] = useState(1);

    const currentStepObj = STEPS.find(s => s.id === step) || STEPS[0];

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg space-y-6">
                {/* Step indicator */}
                <div className="flex items-center justify-between px-2">
                    {STEPS.map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
                                step === s.id
                                    ? "bg-accent text-white"
                                    : step > s.id
                                        ? "bg-success/20 text-success"
                                        : "bg-surface-raised text-text-muted"
                            }`}>
                                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                            </div>
                        </div>
                    ))}
                </div>

                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-5 pb-3">
                        <Badge variant="outline" className="w-fit text-xs font-mono uppercase mb-2">
                            Step {step} of 5 • {currentStepObj.label}
                        </Badge>
                        <CardTitle className="text-lg font-semibold tracking-tight text-text-primary">{currentStepObj.title}</CardTitle>
                        <CardDescription className="text-xs text-text-secondary mt-1 leading-relaxed">
                            {currentStepObj.desc}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0">
                        <div className="p-3 bg-bg rounded-[6px] font-mono text-xs text-text-primary space-y-1.5">
                            <div className="text-text-secondary">$ git commit -m "feat: add automatic README generation"</div>
                            <div className="text-text-secondary">$ git push origin main</div>
                            <div className="text-success font-semibold pt-1">
                                ✓ Webhook event received by PushDoc (7ms)
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={step === 1}
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className="text-xs h-8 rounded-[6px]"
                        >
                            Previous
                        </Button>

                        {step < 5 ? (
                            <Button
                                size="sm"
                                className="gap-1 font-medium text-xs h-8 rounded-[6px]"
                                onClick={() => setStep(s => Math.min(5, s + 1))}
                            >
                                <span>Next Step</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="gap-1.5 font-medium text-xs h-8 rounded-[6px]"
                                onClick={handleLoginRedirect}
                            >
                                <span>Get Started Now</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
