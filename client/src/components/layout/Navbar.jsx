import React from "react";
import { PushDocLogo } from "../ui/PushDocLogo.jsx";
import { Button } from "../ui/button.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.jsx";
import { LogOut, LayoutDashboard, Settings, ExternalLink, ChevronRight, ShieldCheck } from "lucide-react";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Integrations", href: "#integrations" },
    { label: "Security", href: "#security" },
    { label: "FAQ", href: "#faq" },
];

export default function Navbar({ page, setPage, user, handleLoginRedirect, logout }) {
    const isLanding = page === "landing";

    const getPageTitle = () => {
        switch (page) {
            case "dashboard": return "Repositories";
            case "detail": return "Repository Details";
            case "settings": return "Sync Settings";
            case "logs": return "Build History";
            case "ai-provider": return "AI & Security";
            default: return "Dashboard";
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border h-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Logo & Breadcrumb */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setPage(user ? "dashboard" : "landing")}
                        className="bg-transparent border-none p-0 cursor-pointer focus:outline-none flex items-center shrink-0"
                    >
                        <PushDocLogo />
                    </button>

                    {!isLanding && user && (
                        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-border text-xs font-mono text-text-secondary">
                            <span className="text-text-muted">Console</span>
                            <ChevronRight className="h-3 w-3 text-text-muted" />
                            <span className="text-text-primary font-medium">{getPageTitle()}</span>
                        </div>
                    )}
                </div>

                {/* Desktop nav on Landing */}
                {isLanding && (
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map(l => (
                            <a 
                                key={l.label} 
                                href={l.href} 
                                className="text-xs font-medium font-sans text-text-secondary hover:text-text-primary transition-colors"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {user && !isLanding ? (
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://github.com/apps/pushdoc/installations/new" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hidden md:inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-sans transition-colors"
                            >
                                <span>Add GitHub Org</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border border-border">
                                        <Avatar className="h-8 w-8">
                                            {user.avatarUrl ? (
                                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                            ) : null}
                                            <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-3 bg-surface-raised">
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-xs font-semibold text-text-primary">{user.username}</p>
                                            <p className="text-xs text-text-muted font-mono">GitHub Authenticated</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setPage("dashboard")}>
                                        <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                        <span>Repositories</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPage("settings")}>
                                        <Settings className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPage("ai-provider")}>
                                        <ShieldCheck className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                        <span>AI & API Security</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => { logout(); setPage("landing"); }}>
                                        <LogOut className="mr-2 h-3.5 w-3.5 text-danger" />
                                        <span className="text-danger font-medium">Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button 
                            onClick={() => setPage("connect")}
                            size="sm"
                            className="font-medium text-xs h-8 px-4 rounded-[6px]"
                        >
                            Get Started
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
