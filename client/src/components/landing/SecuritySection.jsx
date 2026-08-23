import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { ShieldCheck, EyeOff, KeyRound, Lock } from "lucide-react";

export default function SecuritySection() {
    return (
        <section id="security" className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5 gap-1">
                        <ShieldCheck className="h-3 w-3 text-success" /> Enterprise Security
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Built with zero-retention privacy
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Your source code is processed strictly in volatile memory during active scan jobs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-surface-raised rounded-[6px]">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-accent mb-2">
                                <EyeOff className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">Zero Code Retention</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Git diffs are shallow-cloned in isolated temporary memory buffers and purged immediately post-commit.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px]">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-accent mb-2">
                                <KeyRound className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">HMAC Webhook Signatures</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Every incoming GitHub webhook request is authenticated with SHA-256 HMAC cryptographic signatures.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px]">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-accent mb-2">
                                <Lock className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">BYOK Support</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Provide your own Gemini or Groq API tokens for direct routing without shared rate limits.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
