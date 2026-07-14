import React from "react";
import RepoCard from "./RepoCard";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function RepoGrid({ repos, onRepoClick, triggerSync, token, onToggleActive }) {
    if (repos.length === 0) {
        return (
            <Card className="p-12 text-center max-w-lg mx-auto rounded-[24px]">
                <span className="material-symbols-outlined text-primary text-5xl mb-4">folder_open</span>
                <h3 className="text-lg font-bold mb-2">No Repositories Synchronized</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                    Click the synchronization button above to scan and load your active GitHub repositories.
                </p>
                <Button variant="primary" className="text-xs" onClick={() => triggerSync(token)}>
                    Sync now
                </Button>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {repos.map((repo) => (
                <div key={repo._id} onClick={() => onRepoClick(repo)}>
                    <RepoCard
                        repo={repo}
                        isActive={repo.isActive}
                        onToggleActive={onToggleActive}
                    />
                </div>
            ))}
        </div>
    );
}
