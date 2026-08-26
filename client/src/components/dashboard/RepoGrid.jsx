import React from "react";
import RepoCard from "./RepoCard.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { FolderKanban, RefreshCw, ExternalLink } from "lucide-react";
import { BACKEND_URL } from "../../constants/config";

export default function RepoGrid({ repos, onRepoClick, triggerSync, token, onToggleActive, syncing }) {
    // Show high-density skeleton cards while syncing
    if (syncing) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <Card key={idx} className="bg-surface rounded-[6px] p-4 flex flex-col justify-between space-y-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-[6px] bg-surface-raised shrink-0" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-4 w-3/4 bg-surface-raised" />
                                <Skeleton className="h-3 w-1/2 bg-surface-raised" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16 rounded-[4px] bg-surface-raised" />
                            <Skeleton className="h-5 w-16 rounded-[4px] bg-surface-raised" />
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                            <Skeleton className="h-3 w-16 bg-surface-raised" />
                            <Skeleton className="h-6 w-20 rounded-[6px] bg-surface-raised" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (repos.length === 0) {
        return (
            <Card className="p-8 text-center max-w-md mx-auto bg-surface-raised rounded-[6px]">
                <CardHeader className="p-0 mb-4">
                    <div className="mx-auto h-10 w-10 rounded-[6px] bg-surface flex items-center justify-center text-text-muted mb-2">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold tracking-tight text-text-primary">No Repositories Synchronized</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                        Click the sync button below to import your active GitHub repositories, or connect the PushDoc App.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <Button 
                        size="sm"
                        disabled={syncing}
                        onClick={() => triggerSync(token)}
                        className="gap-2 font-medium text-xs h-8 px-4 rounded-[6px] w-full sm:w-auto"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Syncing..." : "Sync Repositories Now"}</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            window.location.href = `${BACKEND_URL}/github/install`;
                        }}
                        className="gap-2 font-medium text-xs h-8 px-4 rounded-[6px] w-full sm:w-auto"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Install / Reconnect App</span>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Sort: active repos first, then inactive
    const sortedRepos = [...repos].sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRepos.map((repo) => (
                <RepoCard
                    key={repo._id}
                    repo={repo}
                    isActive={repo.isActive}
                    onToggleActive={onToggleActive}
                    onViewDetails={() => onRepoClick(repo)}
                />
            ))}
        </div>
    );
}
