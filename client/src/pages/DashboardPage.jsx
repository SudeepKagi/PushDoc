import React, { useState } from "react";
import StatsStrip from "../components/dashboard/StatsStrip";
import RepoGrid from "../components/dashboard/RepoGrid";

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

    // Pagination (12 repos per page, applying only to inactive repos)
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
        // filter === "inactive"
        totalPages = Math.max(1, Math.ceil(inactiveRepos.length / pageSize));
        const startIndex = (page - 1) * pageSize;
        displayedRepos = inactiveRepos.slice(startIndex, startIndex + pageSize);
    }

    // Reset to page 1 if current page is out of bounds after filtering
    React.useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [filteredRepos.length, totalPages, page]);

    return (
        <div className="space-y-10 animate-fade">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div>
                    <span className="text-xs font-bold text-primary tracking-widest mb-2 block uppercase">Repository System</span>
                    <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-2 uppercase tracking-tight">REPOSITORIES</h1>
                    <p className="text-base text-on-surface-variant max-w-2xl">Manage AI-powered README updates for your GitHub repositories</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAppPage("logs")}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-on-surface-variant font-semibold hover:bg-slate-50 transition-all active:scale-95 text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                        View Logs
                    </button>
                    <button
                        onClick={() => triggerSync(token)}
                        disabled={syncing}
                        className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all px-6 py-3 rounded-full font-semibold text-sm shadow-sm"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${syncing ? 'animate-spin' : ''}`}>refresh</span>
                        {syncing ? "Syncing..." : "Refresh list"}
                    </button>
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
            <section className="bg-slate-50 rounded-full p-2 flex flex-col md:flex-row items-center gap-4 border border-slate-100">
                <div className="flex p-1 bg-white/80 rounded-full w-full md:w-auto shadow-sm border border-slate-100/50">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            filter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                        }`}
                    >
                        All Repositories
                    </button>
                    <button
                        onClick={() => setFilter("active")}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            filter === "active" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter("inactive")}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            filter === "inactive" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                        }`}
                    >
                        Inactive
                    </button>
                </div>
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-full py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all"
                        placeholder="Search repositories..."
                        type="text"
                    />
                </div>
            </section>

            {/* Repository Grid */}
            <div className="space-y-6">
                <RepoGrid
                    repos={displayedRepos}
                    onRepoClick={openDetails}
                    triggerSync={triggerSync}
                    token={token}
                    onToggleActive={toggleRepository}
                />
            </div>

            {/* Pagination Footer */}
            {filteredRepos.length > 0 && (
                <footer className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-on-surface-variant font-medium">
                        {filteredRepos.length} repos · page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                page === 1 ? "text-slate-400 opacity-50 cursor-not-allowed" : "text-primary hover:bg-primary/5"
                            }`}
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                    page === p ? "bg-primary text-on-primary shadow-sm" : "hover:bg-slate-100 text-on-surface"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                page === totalPages ? "text-slate-400 opacity-50 cursor-not-allowed" : "text-primary hover:bg-primary/5"
                            }`}
                        >
                            Next →
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
