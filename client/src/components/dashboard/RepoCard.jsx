import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { FolderGit2, ExternalLink, Lock, Unlock, CheckCircle2, PauseCircle } from "lucide-react";

export default function RepoCard({ repo, isActive, onToggleActive, onViewDetails }) {
    const ownerUpper = (repo.owner || "").toUpperCase();
    const branchUpper = (repo.branch || "MAIN").toUpperCase();

    return (
        <Card 
            className={`transition-colors duration-150 cursor-pointer flex flex-col justify-between rounded-[6px] ${
                isActive ? "bg-surface hover:bg-surface-raised" : "bg-surface/80 hover:bg-surface-raised opacity-90"
            }`}
            onClick={onViewDetails}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[6px] bg-surface-raised flex items-center justify-center text-text-secondary shrink-0">
                            <FolderGit2 className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <CardTitle className="text-sm font-semibold tracking-tight text-text-primary font-mono line-clamp-1">
                                    {repo.name}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-text-muted hover:text-text-primary p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(repo.cloneUrl, "_blank");
                                    }}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                            <CardDescription className="text-xs text-text-secondary font-mono line-clamp-1 mt-0.5">
                                {repo.fullName}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-3">
                    <span>{ownerUpper}</span>
                    <span>•</span>
                    <span>{branchUpper}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal gap-1">
                        {repo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {repo.private ? "Private" : "Public"}
                    </Badge>

                    <Badge variant={isActive ? "success" : "secondary"} className="text-xs font-normal gap-1">
                        {isActive ? <CheckCircle2 className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
                        {isActive ? "Active" : "Paused"}
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-border mt-2 pt-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary font-mono">Auto-Sync</span>
                <Button
                    variant={isActive ? "outline" : "default"}
                    size="sm"
                    className="h-6 text-xs font-medium rounded-[6px] px-2.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(repo._id);
                    }}
                >
                    {isActive ? "Disable" : "Enable"}
                </Button>
            </CardFooter>
        </Card>
    );
}
