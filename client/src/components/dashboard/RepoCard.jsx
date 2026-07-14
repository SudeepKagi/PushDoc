import React from "react";

export default function RepoCard({ repo, isActive, onToggleActive }) {
    const ownerUpper = (repo.owner || "").toUpperCase();
    const branchUpper = (repo.branch || "MAIN").toUpperCase();

    return (
        <div 
            className={`bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between min-h-[220px] cursor-default hover:scale-[1.01] ${
                isActive ? "ring-2 ring-primary/20" : ""
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[24px]">folder</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-headline text-lg font-bold text-on-surface uppercase leading-tight line-clamp-1">{repo.name}</h3>
                            <span 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(repo.cloneUrl, "_blank");
                                }}
                                className="material-symbols-outlined text-[16px] text-outline cursor-pointer hover:text-primary"
                            >
                                open_in_new
                            </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium mt-1 line-clamp-1">{repo.fullName}</p>
                    </div>
                </div>
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(repo._id);
                    }}
                    className="relative inline-flex items-center cursor-pointer"
                >
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${isActive ? 'bg-primary' : 'bg-slate-200'}`}>
                        <div className={`absolute top-[2px] left-[2px] bg-white border border-slate-300 rounded-full h-5 w-5 transition-transform duration-205 ${isActive ? 'translate-x-5' : ''}`}></div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 mt-auto">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">{ownerUpper}</span>
                    <span className="w-1 h-1 rounded-full bg-outline/30"></span>
                    <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">{branchUpper}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">{repo.private ? "lock" : "lock_open"}</span>
                            {repo.private ? "Private" : "Public"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                            {isActive ? "AI updates enabled" : "AI updates disabled"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
