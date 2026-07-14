import React from "react";

export default function Sidebar({ page, setPage }) {
    const menuItems = [
        { key: "dashboard", icon: "dashboard", label: "Dashboard" },
        { key: "settings", icon: "settings", label: "Repository Settings" },
        { key: "logs", icon: "terminal", label: "Build History & Logs" },
        { key: "ai-provider", icon: "psychology", label: "AI Provider Keys" }
    ];

    return (
        <aside className="w-64 border-r border-outline-variant/20 bg-surface/80 backdrop-blur-md flex flex-col justify-between p-6 h-screen sticky top-0">
            <div className="space-y-8">
                <div className="text-xs font-bold text-outline uppercase tracking-widest pl-3">SaaS Control Center</div>
                <ul className="space-y-1.5">
                    {menuItems.map(({ key, icon, label }) => (
                        <li
                            key={key}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all ${
                                page === key || (key === "dashboard" && page === "detail")
                                    ? "bg-primary text-white"
                                    : "text-on-surface-variant hover:bg-surface-container-high"
                            }`}
                            onClick={() => setPage(key)}
                        >
                            <span className="material-symbols-outlined text-lg">{icon}</span>
                            {label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-4">
                <div className="border-t border-outline-variant/20 pt-4">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error-container/20 transition-all"
                        onClick={() => setPage("landing")}
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Exit to Landing
                    </button>
                </div>
            </div>
        </aside>
    );
}
