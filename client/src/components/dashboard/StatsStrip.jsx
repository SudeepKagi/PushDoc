import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.jsx";
import { FolderGit2, CheckCircle2, PauseCircle, Lock } from "lucide-react";

export default function StatsStrip({ totalRepos, activeCount, inactiveCount, privateCount }) {
    const stats = [
        { label: "Total Repositories", value: totalRepos, icon: FolderGit2, color: "text-text-primary" },
        { label: "Active Integration", value: activeCount, icon: CheckCircle2, color: "text-success" },
        { label: "Paused", value: inactiveCount, icon: PauseCircle, color: "text-text-muted" },
        { label: "Private Repos", value: privateCount, icon: Lock, color: "text-text-muted" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} className="bg-surface-raised rounded-[6px]">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-3">
                            <CardTitle className="text-xs font-medium text-text-secondary tracking-tight font-sans">
                                {stat.label}
                            </CardTitle>
                            <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className={`text-xl font-bold font-mono tracking-tight ${stat.color}`}>
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
