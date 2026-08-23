import React, { useState, useEffect } from "react";
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
import { LogOut, LayoutDashboard, Settings } from "lucide-react";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Integrations", href: "#integrations" },
    { label: "Security", href: "#security" },
    { label: "FAQ", href: "#faq" },
];

export default function Navbar({ page, setPage, user, handleLoginRedirect, logout }) {
    const isLanding = page === "landing";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <button 
                    onClick={() => setPage(user ? "dashboard" : "landing")}
                    className="bg-transparent border-none p-0 cursor-pointer focus:outline-none flex items-center"
                >
                    <PushDocLogo />
                </button>

                {/* Desktop nav */}
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                                    <Avatar className="h-8 w-8">
                                        {user.avatarUrl ? (
                                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                                        ) : null}
                                        <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-0.5">
                                        <p className="text-xs font-semibold text-text-primary">{user.username}</p>
                                        <p className="text-xs text-text-muted font-mono">GitHub Account</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setPage("dashboard")}>
                                    <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                    <span>Dashboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPage("settings")}>
                                    <Settings className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { logout(); setPage("landing"); }}>
                                    <LogOut className="mr-2 h-3.5 w-3.5 text-danger" />
                                    <span className="text-danger">Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button 
                            onClick={() => setPage("connect")}
                            size="sm"
                            className="font-medium text-xs h-7 px-4 rounded-[6px]"
                        >
                            Get Started
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
