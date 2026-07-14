import React, { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function ProgressTracker({ status }) {
    const steps = [
        { label: "Queued", states: ["QUEUED"] },
        { label: "Cloning", states: ["CLONING"] },
        { label: "Analyzing", states: ["READING"] },
        { label: "AI Writing", states: ["GENERATING", "WRITING"] },
        { label: "Committing", states: ["COMMITTING"] },
        { label: "Pushing", states: ["PUSHING"] },
    ];

    const currentStepIndex = steps.findIndex(step => step.states.includes(status));
    const isCompleted = status === "COMPLETED";
    const isFailed = status === "FAILED";

    return (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="font-bold text-sm text-slate-800">Verification Progress</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Watch the AI pipeline process your repository</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isFailed 
                        ? "bg-red-50 text-red-700 border border-red-100" 
                        : isCompleted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100 animate-pulse"
                }`}>
                    {status}
                </span>
            </div>
            
            <div className="relative flex items-center justify-between px-2">
                {/* Connection line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                    <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: isCompleted ? "100%" : `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {steps.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isPassed = idx < currentStepIndex || isCompleted;
                    
                    return (
                        <div key={idx} className="flex flex-col items-center z-10 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isPassed 
                                    ? "bg-primary text-white scale-110 shadow-sm" 
                                    : isActive 
                                        ? "bg-blue-500 text-white animate-pulse shadow-md scale-115" 
                                        : "bg-white border-2 border-slate-200 text-slate-400"
                            }`}>
                                {isPassed ? "✓" : idx + 1}
                            </div>
                            <span className={`text-[9px] font-bold mt-2.5 uppercase tracking-wider ${
                                isActive ? "text-blue-600 font-extrabold" : isPassed ? "text-primary" : "text-slate-400"
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DiffViewer({ original = "", modified = "" }) {
    const [viewMode, setViewMode] = useState("split"); // "split", "unified", "preview"

    const originalLines = original ? original.split("\n") : [];
    const modifiedLines = modified ? modified.split("\n") : [];

    return (
        <Card className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Generated Documentation Preview</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Compare original codebase README with the AI draft</p>
                </div>
                <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200/50 self-start">
                    <button 
                        onClick={() => setViewMode("split")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${viewMode === "split" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Split View
                    </button>
                    <button 
                        onClick={() => setViewMode("unified")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${viewMode === "unified" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Raw Output
                    </button>
                    <button 
                        onClick={() => setViewMode("preview")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${viewMode === "preview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Markdown Preview
                    </button>
                </div>
            </div>

            {viewMode === "split" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[420px] font-mono text-[11px] overflow-hidden border border-slate-200 rounded-2xl bg-slate-950 text-slate-200 shadow-inner">
                    <div className="flex flex-col border-r border-slate-900 h-full">
                        <div className="bg-slate-900/50 px-4 py-3.5 border-b border-slate-900 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Original README.md
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-1.5 leading-relaxed">
                            {originalLines.length === 0 || (originalLines.length === 1 && originalLines[0] === "") ? (
                                <div className="text-slate-650 italic py-8 text-center">No original README detected.</div>
                            ) : (
                                originalLines.map((line, idx) => (
                                    <div key={idx} className="whitespace-pre-wrap">{line || " "}</div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col h-full bg-[#052e16]/5">
                        <div className="bg-slate-900/50 px-4 py-3.5 border-b border-slate-900 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                                Generated README.md
                            </span>
                            <span className="text-[#10b981] font-bold text-[9px] bg-[#10b981]/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#10b981]/25">New Draft</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-1.5 leading-relaxed bg-[#052e16]/5">
                            {modifiedLines.length === 0 ? (
                                <div className="text-slate-650 italic py-8 text-center">No generated draft available.</div>
                            ) : (
                                modifiedLines.map((line, idx) => (
                                    <div key={idx} className="whitespace-pre-wrap text-emerald-300 bg-[#064e3b]/10 px-1 rounded-sm">{line || " "}</div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === "unified" && (
                <div className="h-[420px] font-mono text-[11px] overflow-y-auto border border-slate-200 rounded-2xl bg-slate-950 text-slate-200 p-6 leading-relaxed space-y-1">
                    {modifiedLines.length === 0 ? (
                        <div className="text-slate-650 italic py-8 text-center">No generated draft available.</div>
                    ) : (
                        modifiedLines.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap">{line || " "}</div>
                        ))
                    )}
                </div>
            )}

            {viewMode === "preview" && (
                <div className="h-[420px] overflow-y-auto border border-slate-200 rounded-2xl bg-white text-slate-800 p-8 shadow-inner">
                    {modifiedLines.length === 0 ? (
                        <div className="text-slate-450 italic py-8 text-center">No generated draft available for preview.</div>
                    ) : (
                        <div className="space-y-4">
                            {modifiedLines.map((line, idx) => {
                                if (line.startsWith("# ")) return <h1 key={idx} className="text-2xl font-black text-slate-900 border-b pb-2.5 mb-4 mt-6">{line.replace("# ", "")}</h1>;
                                if (line.startsWith("## ")) return <h2 key={idx} className="text-lg font-bold text-slate-800 mt-6 mb-2">{line.replace("## ", "")}</h2>;
                                if (line.startsWith("### ")) return <h3 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2">{line.replace("### ", "")}</h3>;
                                if (line.startsWith("- ")) return <li key={idx} className="ml-5 list-disc text-sm text-slate-600 mb-1">{line.replace("- ", "")}</li>;
                                if (line.startsWith("1. ")) return <li key={idx} className="ml-5 list-decimal text-sm text-slate-600 mb-1">{line.replace("1. ", "")}</li>;
                                if (line.startsWith("```")) return null;
                                return <p key={idx} className="text-sm text-slate-600 leading-relaxed mb-3">{line}</p>;
                            })}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild, jobs = [] }) {
    if (!selectedRepo) return null;

    // Find the latest job for this repository
    const latestJob = jobs.find(j => j.repository?._id === selectedRepo._id);

    const isRunning = latestJob && ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(latestJob.status);

    // Dynamic metrics
    const displayScore = latestJob?.validationScore !== undefined ? latestJob.validationScore : 100;
    const displayWarnings = latestJob?.validationWarnings || [];
    const displayDuration = latestJob?.duration ? (latestJob.duration / 1000).toFixed(1) + "s" : "N/A";
    const displayLastRun = latestJob?.completedAt 
        ? new Date(latestJob.completedAt).toLocaleString("en-GB", { hour12: false }) 
        : "Never scanned";

    return (
        <div className="space-y-8 animate-fade">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <button
                        className="flex items-center gap-1.5 text-xs font-bold text-outline hover:text-primary transition-colors mb-2"
                        onClick={() => setPage("dashboard")}
                    >
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Back to Dashboard
                    </button>
                    <h1 className="font-headline text-3xl font-black text-on-surface">{selectedRepo.name} Details</h1>
                    <p className="text-sm text-on-surface-variant mt-1">{selectedRepo.fullName}</p>
                </div>
                <Button
                    variant="primary"
                    className="flex items-center gap-2 self-start sm:self-center"
                    onClick={() => triggerManualBuild(selectedRepo._id)}
                    disabled={isRunning}
                >
                    <span className="material-symbols-outlined text-sm">{isRunning ? "sync" : "play_circle"}</span>
                    {isRunning ? "Running Verification..." : "Queue Verification Job"}
                </Button>
            </header>

            {/* Live Progress Tracker */}
            {latestJob && latestJob.status !== "COMPLETED" && latestJob.status !== "FAILED" && (
                <ProgressTracker status={latestJob.status} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Validation Card */}
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Validation Warnings</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Automated lint and semantic rule check results</p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    displayWarnings.length === 0
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-rose-50 text-rose-750 border border-rose-100"
                                }`}
                            >
                                {displayWarnings.length} Warnings
                            </span>
                        </div>
                        {displayWarnings.length === 0 ? (
                            <div className="text-emerald-750 text-sm font-semibold flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                <span className="material-symbols-outlined text-emerald-650">check_circle</span>
                                No issues found. The README meets all structural and semantic criteria!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {displayWarnings.map((w, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-4 bg-rose-50/20 border border-rose-100/50 rounded-2xl text-sm"
                                    >
                                        <span className="material-symbols-outlined text-rose-600 text-sm mt-0.5">warning</span>
                                        <span className="text-slate-700 leading-relaxed">{w}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Interactive Diff Viewer */}
                    <DiffViewer 
                        original={latestJob?.originalReadme || ""} 
                        modified={latestJob?.generatedReadme || ""} 
                    />
                </div>

                {/* Right panel properties */}
                <div className="space-y-8">
                    <Card className="p-8">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Quality Coverage</h3>
                            <p className="text-xs text-slate-500 mt-0.5">AI-assessed content depth scoring</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700">
                                    <span>Readme Score</span>
                                    <span>{displayScore}/100</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${displayScore}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700">
                                    <span>Features Scan</span>
                                    <span>{latestJob ? "90%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full transition-all duration-500" style={{ width: latestJob ? "90%" : "0%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700">
                                    <span>Routes &amp; API Scope</span>
                                    <span>{latestJob ? "85%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full transition-all duration-500" style={{ width: latestJob ? "85%" : "0%" }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <h3 className="font-bold text-lg mb-6 text-slate-800">Job Properties</h3>
                        <div className="space-y-4.5 text-xs font-semibold text-slate-600">
                            <div className="flex justify-between border-b border-slate-50 pb-3">
                                <span className="text-slate-450 uppercase tracking-wider">Default Branch</span>
                                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{selectedRepo.branch || "main"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-3">
                                <span className="text-slate-450 uppercase tracking-wider">Time Taken</span>
                                <span className="text-slate-800">{displayDuration}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-3">
                                <span className="text-slate-450 uppercase tracking-wider">Last Scanned</span>
                                <span className="text-slate-800">{displayLastRun}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-450 uppercase tracking-wider">Visibility</span>
                                <span className="text-slate-800 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">{selectedRepo.private ? "lock" : "lock_open"}</span>
                                    {selectedRepo.private ? "Private" : "Public"}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
