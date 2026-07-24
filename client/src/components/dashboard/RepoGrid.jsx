import React from "react";
import RepoCard from "./RepoCard.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { FolderKanban, RefreshCw } from "lucide-react";

export default function RepoGrid({ repos, onRepoClick, triggerSync, token, onToggleActive, syncing }) {
    if (repos.length === 0) {
        return (
            <Card className="p-12 text-center max-w-md mx-auto shadow-none border-dashed border-border">
                <CardHeader className="p-0 mb-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-2">
                        <FolderKanban className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold tracking-tight">No Repositories Synchronized</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                        Click the sync button below to import your active GitHub repositories.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Button 
                        size="sm"
                        disabled={syncing}
                        onClick={() => triggerSync(token)}
                        className="gap-2 font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
