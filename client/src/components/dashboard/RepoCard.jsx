import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { FolderGit2, ExternalLink, Lock, Unlock, CheckCircle2, PauseCircle, RefreshCw } from "lucide-react";

export default function RepoCard({ repo, isActive, onToggleActive, onViewDetails }) {
    const [toggling, setToggling] = useState(false);

    const ownerUpper = (repo.owner || "").toUpperCase();
    const branchUpper = (repo.branch || "MAIN").toUpperCase();

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (toggling) return;
        setToggling(true);
        try {
            await onToggleActive(repo._id);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Card 
            className={`transition-all duration-150 cursor-pointer flex flex-col justify-between rounded-[6px] border border-transparent ${
                isActive ? "bg-surface hover:bg-surface-raised hover:border-border" : "bg-surface/75 hover:bg-surface-raised opacity-90"
            }`}
            onClick={onViewDetails}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-[6px] bg-surface-raised flex items-center justify-center text-text-secondary shrink-0">
                            <FolderGit2 className="h-4 w-4 text-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <CardTitle className="text-sm font-semibold tracking-tight text-text-primary font-mono truncate">
                                    {repo.name}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-text-muted hover:text-text-primary p-0 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(repo.cloneUrl, "_blank");
                                    }}
                                    title="Open on GitHub"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                            <CardDescription className="text-xs text-text-secondary font-mono truncate mt-0.5">
                                {repo.fullName}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-3">
                    <span className="truncate">{ownerUpper}</span>
                    <span>•</span>
                    <span className="shrink-0">{branchUpper}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal gap-1">
                        {repo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {repo.private ? "Private" : "Public"}
                    </Badge>

                    <Badge 
                        variant={isActive ? "success" : "secondary"} 
                        className={`text-xs font-normal gap-1.5 ${toggling ? "animate-pulse" : ""}`}
                    >
                        {toggling ? (
                            <>
                                <RefreshCw className="h-3 w-3 animate-spin text-accent" />
                                <span>Updating...</span>
                            </>
                        ) : isActive ? (
                            <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Active</span>
                            </>
                        ) : (
                            <>
                                <PauseCircle className="h-3 w-3" />
                                <span>Paused</span>
                            </>
                        )}
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-2 border-t border-border mt-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary font-mono">Auto-Sync</span>
                <Button
                    variant={isActive ? "outline" : "default"}
                    size="sm"
                    disabled={toggling}
                    className="h-7 text-xs font-medium rounded-[6px] px-3 gap-1.5 min-w-[76px]"
                    onClick={handleToggle}
                >
                    {toggling ? (
                        <>
                            <RefreshCw className="h-3 w-3 animate-spin text-accent" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>{isActive ? "Disable" : "Enable"}</span>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
