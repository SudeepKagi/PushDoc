import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Check, RefreshCw } from "lucide-react";
import { GithubIcon as Github } from "../components/ui/githubIcon.jsx";



export default function ConnectPage({ handleLoginRedirect, setPage }) {
    const [connecting, setConnecting] = useState(false);

    const handleConnect = () => {
        setConnecting(true);
        setTimeout(() => {
            handleLoginRedirect();
        }, 80);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader className="text-center p-6 pb-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 border border-primary/20">
                        <Github className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Connect to GitHub</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                        Authorize PushDoc to sync repositories and automate README generation.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-4">
                    <div className="space-y-3 border-t border-b border-border py-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requested Scopes</p>

                        <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-foreground">Repository Contents (Read)</p>
                                <p className="text-[11px] text-muted-foreground">To analyze codebase structure, routes, and models.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-foreground">README Commits (Write)</p>
                                <p className="text-[11px] text-muted-foreground">To commit generated README files back to your branch.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-foreground">Webhook Events (Listen)</p>
                                <p className="text-[11px] text-muted-foreground">To capture code pushes automatically.</p>
                            </div>
                        </div>
                    </div>

                    {connecting && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-700 dark:text-amber-400">
                            The server may take 20–50 seconds to wake up on first load. GitHub authorization page will open shortly.
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-6 pt-0 flex flex-col gap-2">
                    <Button
                        className="w-full gap-2 font-medium"
                        onClick={handleConnect}
                        disabled={connecting}
                    >
                        {connecting ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Redirecting to GitHub...</span>
                            </>
                        ) : (
                            <>
                                <Github className="h-4 w-4" />
                                <span>Authorize PushDoc App</span>
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => setPage("landing")}
                        disabled={connecting}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
