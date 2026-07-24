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
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
            <div className="space-y-4">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    Control Center
                </div>
                <nav className="space-y-1">
                    {menuItems.map(({ key, icon: Icon, label }) => {
                        const isActive = page === key || (key === "dashboard" && page === "detail");
                        return (
                            <Button
                                key={key}
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 h-10 font-medium ${
                                    isActive ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setPage(key)}
                            >
                                <Icon className="h-4 w-4" />
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
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive h-9"
                    onClick={() => setPage("landing")}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Exit to Landing</span>
                </Button>
            </div>
        </aside>
    );
}
