import React from "react";

export default function BuildLogsPage({
    jobs = [],
    loadingJobs = false,
    activeBuildIndex,
    setActiveBuildIndex,
    logsSearchQuery,
    setLogsSearchQuery,
    liveLogs,
    logsContainerRef,
    rerunJob,
    setPage
}) {
    const totalRuns = jobs.length;
    const completedCount = jobs.filter(j => j.status === 'COMPLETED').length;
    const successRate = totalRuns > 0 
        ? ((completedCount / totalRuns) * 100).toFixed(1) + '%' 
        : '100%';
        
    const validDurations = jobs.filter(j => j.duration);
    const avgDuration = validDurations.length > 0
        ? (validDurations.reduce((acc, j) => acc + j.duration, 0) / validDurations.length / 1000).toFixed(1) + 's'
        : '0s';

    const activeJob = jobs[activeBuildIndex];

    return (
        <div className="space-y-10 animate-fade">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <nav className="flex items-center gap-2 text-on-surface-variant mb-2 text-xs font-bold">
                        <span 
                            className="cursor-pointer hover:text-primary transition-colors" 
                            onClick={() => setPage("dashboard")}
                        >
                            Dashboard
                        </span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary font-bold">Build History</span>
                    </nav>
                    <h1 className="font-headline text-3xl font-black text-on-surface">Build History &amp; Execution Logs</h1>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setPage("dashboard")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-on-surface-variant font-bold hover:bg-slate-50 transition-all active:scale-95 text-xs bg-white shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Dashboard
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all active:scale-95 text-xs" onClick={() => alert("Downloading full run logs...")}>
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download Full Log
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-on-background text-surface font-bold hover:shadow-lg transition-all active:scale-95 text-xs text-white" onClick={rerunJob}>
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Re-run Job
                    </button>
                </div>
            </header>

            {/* Stats strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-outline-variant/20 bg-white/40">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Runs</p>
                        <p className="text-2xl font-black text-on-surface">{totalRuns}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-outline-variant/20 bg-white/40">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Success Rate</p>
                        <p className="text-2xl font-black text-secondary">{successRate}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-outline-variant/30 bg-white/40">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Avg. Run Time</p>
                        <p className="text-2xl font-black text-on-surface">{avgDuration}</p>
                    </div>
                </div>
            </div>

            {/* Logs Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Commit execution list */}
                <aside className="lg:col-span-4 bg-white rounded-3xl overflow-hidden flex flex-col h-[520px] border border-outline-variant/30 shadow-sm">
                    <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                        <h2 className="font-bold text-base text-on-surface">Commit Execution List</h2>
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">filter_list</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingJobs ? (
                            <div className="text-center text-xs text-on-surface-variant py-8">Loading runs...</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center text-xs text-on-surface-variant py-8">No build runs recorded.</div>
                        ) : (
                            jobs.map((job, idx) => {
                                const isActive = activeBuildIndex === idx;
                                const isCompleted = job.status === "COMPLETED";
                                const isFailed = job.status === "FAILED";
                                
                                return (
                                    <div 
                                        key={job._id}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                            isActive 
                                                ? "bg-primary/5 border-primary/20" 
                                                : "bg-white/40 border-outline-variant/10 hover:bg-surface-container-low"
                                        }`} 
                                        onClick={() => setActiveBuildIndex(idx)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-primary font-bold text-xs">#{job.commitSha.substring(0, 7)}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                isCompleted 
                                                    ? "bg-emerald-50 text-emerald-700" 
                                                    : isFailed 
                                                        ? "bg-rose-50 text-rose-700" 
                                                        : "bg-blue-50 text-blue-700"
                                            }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-on-surface font-bold line-clamp-1">{job.repository?.name || "Unknown Repo"}</p>
                                        <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">Branch: {job.branch}</p>
                                        <div className="flex gap-4 mt-3 text-outline text-[11px] font-semibold">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[13px]">person</span> 
                                                {job.repository?.owner || "developer"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[13px]">schedule</span> 
                                                {job.duration ? (job.duration / 1000).toFixed(1) + "s" : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Terminal Console */}
                <section className="lg:col-span-8 flex flex-col h-[520px] bg-on-background rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <h3 className="text-white/60 font-mono text-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">terminal</span>
                                Live Worker Log Console — job_{activeJob?.bullJobId || "console"}.log
                            </h3>
                        </div>
                        <span className="flex items-center gap-1.5 text-secondary text-[11px] font-mono font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                            CONNECTED
                        </span>
                    </div>
                    {/* Search Filter log */}
                    <div className="px-6 py-2 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                        <span className="material-symbols-outlined text-white/40 text-sm">search</span>
                        <input
                            className="bg-transparent border-none text-white/80 placeholder-white/30 text-xs font-mono w-full focus:ring-0 p-1 outline-none"
                            onChange={(e) => setLogsSearchQuery(e.target.value)}
                            placeholder="Filter logs..."
                            type="text"
                            value={logsSearchQuery}
                        />
                    </div>
                    {/* Log lines area */}
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-[12px] leading-relaxed text-white/80 space-y-1.5" ref={logsContainerRef}>
                        {liveLogs
                            .filter((l) => l.text.toLowerCase().includes(logsSearchQuery.toLowerCase()))
                            .map((log, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <span className="text-white/30">[{log.time}]</span>
                                    <span className={log.type === "SUCCESS" ? "text-secondary font-bold" : "text-primary-fixed-dim"}>
                                        [{log.type}]
                                    </span>
                                    <span>{log.text}</span>
                                </div>
                            ))}
                        <div className="flex items-center gap-1">
                            <span className="text-white/30">[{new Date().toLocaleTimeString("en-GB", { hour12: false })}]</span>
                            <span className="text-primary-fixed-dim animate-pulse">_</span>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                        <span>Lines: {liveLogs.length}</span>
                        <span>Buffer: OK</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
