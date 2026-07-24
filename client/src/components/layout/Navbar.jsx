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
    { label: "Solutions", href: "#features" },
    { label: "Features", href: "#capabilities" },
];

export default function Navbar({ page, setPage, user, handleLoginRedirect, logout }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isLanding = page === "landing";

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled || !isLanding ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-background/80 backdrop-blur-md border-b border-border"
        }`}>
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <button 
                    onClick={() => setPage(user ? "dashboard" : "landing")}
                    className="bg-transparent border-none p-0 cursor-pointer focus:outline-none"
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
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">GitHub Account</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setPage("dashboard")}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPage("settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { logout(); setPage("landing"); }}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button 
                            onClick={() => setPage("connect")}
                            size="sm"
                            className="rounded-full shadow-sm font-medium"
                        >
                            Get Started
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
