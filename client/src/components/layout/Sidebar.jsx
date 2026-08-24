import React from "react";
import { LayoutDashboard, Settings, Terminal, ShieldCheck, LogOut, FolderGit2, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { Badge } from "../ui/badge.jsx";

export default function Sidebar({ page, setPage }) {
    const navSections = [
        {
            title: "PLATFORM",
            items: [
                { key: "dashboard", icon: LayoutDashboard, label: "Repositories" },
            ]
        },
        {
            title: "CONFIGURATION & LOGS",
            items: [
                { key: "settings", icon: Settings, label: "Sync Settings" },
                { key: "logs", icon: Terminal, label: "Build History" },
                { key: "ai-provider", icon: ShieldCheck, label: "AI & Security" },
            ]
        }
    ];

    return (
        <aside className="w-64 border-r border-border bg-surface-raised flex flex-col justify-between p-4 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 font-sans select-none">
            <div className="space-y-6">
                {navSections.map((section) => (
                    <div key={section.title} className="space-y-1.5">
                        <div className="px-2.5 py-1 text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider">
                            {section.title}
                        </div>
                        <nav className="space-y-1">
                            {section.items.map(({ key, icon: Icon, label }) => {
                                const isActive = page === key || (key === "dashboard" && page === "detail");
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`w-full flex items-center justify-between gap-2.5 h-8 px-2.5 rounded-[6px] text-xs font-medium transition-all ${
                                            isActive 
                                                ? "bg-surface text-text-primary font-semibold shadow-sm border-l-2 border-accent" 
                                                : "text-text-secondary hover:text-text-primary hover:bg-surface/50 border-l-2 border-transparent"
                                        }`}
                                        onClick={() => setPage(key)}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
                                            <span>{label}</span>
                                        </div>
                                        {isActive && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Bottom Status Card */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="p-2.5 bg-surface rounded-[6px] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-text-primary font-medium">Pipeline Ready</span>
                    </div>
                    <span className="text-[10px] text-text-muted">v2.0</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-text-muted hover:text-danger hover:bg-surface h-7 px-2 text-xs rounded-[6px]"
                    onClick={() => setPage("landing")}
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Exit to Landing</span>
                </Button>
            </div>
        </aside>
    );
}
