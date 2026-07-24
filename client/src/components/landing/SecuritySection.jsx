import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { ShieldCheck, Lock, EyeOff, KeyRound, Check } from "lucide-react";

export default function SecuritySection() {
    return (
        <section id="security" className="py-24 bg-muted/20 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <Badge variant="outline" className="text-xs font-normal rounded-full px-3 gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Enterprise Security
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
                        Built with zero-retention privacy
                    </h2>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Your source code is processed strictly in volatile memory during active scan jobs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <Card className="bg-card border-border shadow-none">
                        <CardContent className="p-6 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <EyeOff className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Zero Code Retention</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Git diffs are shallow-cloned in isolated temporary memory buffers and purged immediately post-commit.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-none">
                        <CardContent className="p-6 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">HMAC Webhook Signatures</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Every incoming GitHub webhook request is authenticated with SHA-256 HMAC cryptographic signatures.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-none">
                        <CardContent className="p-6 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Lock className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">BYOK (Bring Your Own Key)</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Provide your own Gemini or Groq API tokens for direct routing without shared rate limits.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
