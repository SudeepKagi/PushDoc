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
            className={`transition-all duration-200 hover:border-foreground/20 cursor-pointer flex flex-col justify-between ${
                isActive ? "border-primary/50 shadow-sm" : "opacity-90"
            }`}
            onClick={onViewDetails}
        >
            <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 border border-border">
                            <FolderGit2 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-semibold tracking-tight text-foreground line-clamp-1">
                                    {repo.name}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(repo.cloneUrl, "_blank");
                                    }}
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <CardDescription className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {repo.fullName}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
                    <span>{ownerUpper}</span>
                    <span>•</span>
                    <span>{branchUpper}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal gap-1">
                        {repo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {repo.private ? "Private" : "Public"}
                    </Badge>

                    <Badge variant={isActive ? "success" : "secondary"} className="text-xs font-normal gap-1">
                        {isActive ? <CheckCircle2 className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
                        {isActive ? "AI Updates Enabled" : "Paused"}
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 border-t border-border/40 mt-3 pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Auto-Sync</span>
                <Button
                    variant={isActive ? "outline" : "default"}
                    size="sm"
                    className="h-7 text-xs font-medium"
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
