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
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 relative font-sans">
            <Card className="w-full max-w-md bg-surface rounded-[6px] overflow-hidden">
                <CardHeader className="text-center p-5 pb-3">
                    <div className="mx-auto h-10 w-10 rounded-[6px] bg-surface-raised flex items-center justify-center text-accent mb-2">
                        <Github className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold tracking-tight text-text-primary">Connect to GitHub</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">
                        Authorize PushDoc to sync repositories and automate README generation.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-1 space-y-3">
                    <div className="space-y-2.5 border-t border-b border-border py-3">
                        <p className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider">Requested Permissions</p>

                        <div className="flex items-start gap-2.5">
                            <div className="h-4 w-4 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0 mt-0.5">
                                <Check className="h-2.5 w-2.5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-text-primary">Repository Contents (Read)</p>
                                <p className="text-xs text-text-secondary">Analyze codebase structure, routes, and models.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="h-4 w-4 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0 mt-0.5">
                                <Check className="h-2.5 w-2.5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-text-primary">README Commits (Write)</p>
                                <p className="text-xs text-text-secondary">Commit generated README files back to your branch.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="h-4 w-4 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0 mt-0.5">
                                <Check className="h-2.5 w-2.5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-text-primary">Webhook Events (Listen)</p>
                                <p className="text-xs text-text-secondary">Capture code pushes automatically.</p>
                            </div>
                        </div>
                    </div>

                    {connecting && (
                        <div className="p-2.5 bg-warning/15 rounded-[4px] text-xs text-warning">
                            The server may take 20–50 seconds to wake up on first load. GitHub authorization page will open shortly.
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-5 pt-0 flex flex-col gap-2">
                    <Button
                        className="w-full gap-2 font-medium text-xs h-8 rounded-[6px]"
                        onClick={handleConnect}
                        disabled={connecting}
                    >
                        {connecting ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Redirecting to GitHub...</span>
                            </>
                        ) : (
                            <>
                                <Github className="h-3.5 w-3.5" />
                                <span>Authorize PushDoc App</span>
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-xs h-8 rounded-[6px]"
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
