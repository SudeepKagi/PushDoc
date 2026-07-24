import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.jsx";
import { FolderGit2, CheckCircle2, PauseCircle, Lock } from "lucide-react";

export default function StatsStrip({ totalRepos, activeCount, inactiveCount, privateCount }) {
    const stats = [
        { label: "Total Repositories", value: totalRepos, icon: FolderGit2, color: "text-foreground" },
        { label: "Active Integration", value: activeCount, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Paused", value: inactiveCount, icon: PauseCircle, color: "text-muted-foreground" },
        { label: "Private Repos", value: privateCount, icon: Lock, color: "text-muted-foreground" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} className="shadow-none border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground tracking-tight">
                                {stat.label}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
