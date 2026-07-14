import React from "react";

export default function StatsStrip({ totalRepos, activeCount, inactiveCount, privateCount }) {
    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform duration-200">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Total</p>
                <p className="text-4xl font-extrabold text-on-surface">{totalRepos}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform duration-200">
                <p className="text-xs font-bold text-primary uppercase mb-2">Active</p>
                <p className="text-4xl font-extrabold text-primary">{activeCount}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform duration-200">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Inactive</p>
                <p className="text-4xl font-extrabold text-on-surface">{inactiveCount}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform duration-200">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Private</p>
                <p className="text-4xl font-extrabold text-on-surface">{privateCount}</p>
            </div>
        </section>
    );
}
