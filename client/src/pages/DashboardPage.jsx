import React, { useState, useEffect } from "react";
import StatsStrip from "../components/dashboard/StatsStrip.jsx";
import RepoGrid from "../components/dashboard/RepoGrid.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { RefreshCw, Terminal, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardPage({ repos, openDetails, triggerSync, token, syncing, setAppPage, toggleRepository }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    // Calculate Stats from database-driven isActive field
    const totalRepos = repos.length;
    const activeCount = repos.filter(r => r.isActive).length;
    const inactiveCount = totalRepos - activeCount;
    const privateCount = repos.filter(r => r.private).length;

    // Filter & Search Repositories
    const filteredRepos = repos.filter(repo => {
        const matchesSearch = 
            repo.name.toLowerCase().includes(search.toLowerCase()) ||
            repo.fullName.toLowerCase().includes(search.toLowerCase());
            
        const isActive = repo.isActive;
        const matchesFilter = 
            filter === "all" ||
            (filter === "active" && isActive) ||
            (filter === "inactive" && !isActive);

        return matchesSearch && matchesFilter;
    });

    const activeRepos = filteredRepos.filter(r => r.isActive);
    const inactiveRepos = filteredRepos.filter(r => !r.isActive);

    // Pagination (12 repos per page)
    const pageSize = 12;
    let displayedRepos = [];
    let totalPages = 1;

    if (filter === "all") {
        totalPages = Math.max(1, Math.ceil(inactiveRepos.length / pageSize));
        const startIndex = (page - 1) * pageSize;
        const paginatedInactive = inactiveRepos.slice(startIndex, startIndex + pageSize);
        if (page === 1) {
            displayedRepos = [...activeRepos, ...paginatedInactive];
        } else {
            displayedRepos = paginatedInactive;
        }
    } else if (filter === "active") {
        totalPages = 1;
        displayedRepos = activeRepos;
    } else {
        totalPages = Math.max(1, Math.ceil(inactiveRepos.length / pageSize));
        const startIndex = (page - 1) * pageSize;
        displayedRepos = inactiveRepos.slice(startIndex, startIndex + pageSize);
    }

    // Reset to page 1 if current page is out of bounds after filtering
    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [filteredRepos.length, totalPages, page]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Repositories
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage AI-powered README generation and auto-commit preferences.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 font-medium"
                        onClick={() => setAppPage("logs")}
                    >
                        <Terminal className="h-4 w-4" />
                        <span>View Logs</span>
                    </Button>
                    <Button
                        size="sm"
                        disabled={syncing}
                        className="gap-2 font-medium shadow-sm"
                        onClick={() => triggerSync(token)}
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Syncing..." : "Refresh List"}</span>
                    </Button>
                </div>
            </div>

            {/* Stats Strip */}
            <StatsStrip 
                totalRepos={totalRepos}
                activeCount={activeCount}
                inactiveCount={inactiveCount}
                privateCount={privateCount}
            />

            {/* Filter and Search Bar Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All Repositories</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search repositories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
            </div>

            {/* Repository Grid */}
            <RepoGrid
                repos={displayedRepos}
                onRepoClick={openDetails}
                triggerSync={triggerSync}
                token={token}
                onToggleActive={toggleRepository}
                syncing={syncing}
            />

            {/* Pagination Footer */}
            {filteredRepos.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Showing page <span className="font-medium text-foreground">{page}</span> of{" "}
                        <span className="font-medium text-foreground">{totalPages}</span> ({filteredRepos.length} total)
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="gap-1 h-8 text-xs"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>Previous</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="gap-1 h-8 text-xs"
                        >
                            <span>Next</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
