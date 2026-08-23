import React from "react";
import RepoCard from "./RepoCard.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { FolderKanban, RefreshCw } from "lucide-react";

export default function RepoGrid({ repos, onRepoClick, triggerSync, token, onToggleActive, syncing }) {
    if (repos.length === 0) {
        return (
            <Card className="p-8 text-center max-w-md mx-auto bg-surface-raised rounded-[6px]">
                <CardHeader className="p-0 mb-4">
                    <div className="mx-auto h-10 w-10 rounded-[6px] bg-surface flex items-center justify-center text-text-muted mb-2">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold tracking-tight text-text-primary">No Repositories Synchronized</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                        Click the sync button below to import your active GitHub repositories.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Button 
                        size="sm"
                        disabled={syncing}
                        onClick={() => triggerSync(token)}
                        className="gap-2 font-medium text-xs h-8 px-4 rounded-[6px]"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Syncing..." : "Sync Repositories Now"}</span>
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
