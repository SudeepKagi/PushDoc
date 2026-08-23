import React from "react";
import { LayoutDashboard, Settings, Terminal, Cpu, LogOut } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";

export default function Sidebar({ page, setPage }) {
    const menuItems = [
        { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { key: "settings", icon: Settings, label: "Repository Settings" },
        { key: "logs", icon: Terminal, label: "Build History & Logs" },
        { key: "ai-provider", icon: Cpu, label: "AI Provider Keys" }
    ];

    return (
        <aside className="w-60 border-r border-border bg-surface-raised flex flex-col justify-between p-4 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 font-sans">
            <div className="space-y-4">
                <div className="px-2 py-1 text-xs font-mono font-medium text-text-muted uppercase tracking-wider">
                    Control Center
                </div>
                <nav className="space-y-1">
                    {menuItems.map(({ key, icon: Icon, label }) => {
                        const isActive = page === key || (key === "dashboard" && page === "detail");
                        return (
                            <Button
                                key={key}
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-2.5 h-8 px-2.5 rounded-[6px] text-xs font-medium transition-colors ${
                                    isActive ? "bg-surface text-text-primary font-semibold" : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                                }`}
                                onClick={() => setPage(key)}
                            >
                                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
                                <span>{label}</span>
                            </Button>
                        );
                    })}
                </nav>
            </div>

            <div className="space-y-3 pt-4">
                <Separator />
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2.5 text-text-muted hover:text-danger hover:bg-surface/60 h-8 px-2.5 rounded-[6px] text-xs"
                    onClick={() => setPage("landing")}
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Exit to Landing</span>
                </Button>
            </div>
        </aside>
    );
}
