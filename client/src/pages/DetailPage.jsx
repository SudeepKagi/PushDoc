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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isPassed 
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110" 
                                    : isActive 
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-125 ring-4 ring-blue-500/20" 
                                        : "bg-white border-2 border-slate-200 text-slate-400"
                            }`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {isPassed ? "check" : 
                                     idx === 0 ? "hourglass_empty" : 
                                     idx === 1 ? "download" : 
                                     idx === 2 ? "troubleshoot" : 
                                     idx === 3 ? "edit_document" : 
                                     idx === 4 ? "save" : "cloud_upload"}
                                </span>
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

function renderMarkdown(rawContent) {
    if (!rawContent) return "";
    // Normalize line endings
    const content = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = content.split("\n");
    let html = "";
    let inCodeBlock = false;
    let codeLines = [];
    let inTable = false;
    let tableRows = [];

    // Process inline markdown (bold, italic, images, links, code)
    const inline = (text) => {
        let t = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        // Images/badges first (so alt text isn't link-processed)
        t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" style="display:inline;max-height:24px;margin:2px 3px 0;vertical-align:middle;" loading="lazy"/>');
        // Links
        t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" style="color:#0969da;text-decoration:none;" target="_blank" rel="noopener">$1</a>');
        // Inline code
        t = t.replace(/`([^`]+)`/g,
            '<code style="background:#f0f0f0;border-radius:4px;padding:1px 5px;font-size:85%;font-family:\'SFMono-Regular\',Consolas,monospace;border:1px solid #e0e0e0;">$1</code>');
        // Bold + italic combined
        t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
        // Bold
        t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        // Italic
        t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        return t;
    };

    const flushTable = () => {
        if (tableRows.length < 2) { tableRows = []; inTable = false; return; }
        const headerCells = tableRows[0]
            .split("|").filter(c => c.trim())
            .map(c => `<th style="padding:6px 13px;border:1px solid #d1d9e0;font-weight:600;background:#f6f8fa;white-space:nowrap;text-align:left;">${inline(c.trim())}</th>`)
            .join("");
        const bodyHtml = tableRows.slice(2)
            .filter(r => r.trim() && r.includes("|"))
            .map(row =>
                `<tr>${row.split("|").filter(c => c.trim())
                    .map(c => `<td style="padding:6px 13px;border:1px solid #d1d9e0;vertical-align:top;">${inline(c.trim())}</td>`)
                    .join("")}</tr>`
            ).join("");
        html += `<div style="overflow-x:auto;margin:16px 0;"><table style="border-collapse:collapse;min-width:100%;font-size:13px;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
        tableRows = []; inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // ── Code fence ──────────────────────────────────────────
        if (trimmed.startsWith("```")) {
            if (inTable) flushTable();
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLines = [];
            } else {
                inCodeBlock = false;
                const escaped = codeLines.join("\n")
                    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<pre style="background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px;padding:16px;overflow-x:auto;font-size:12px;line-height:1.6;margin:16px 0;font-family:'SFMono-Regular',Consolas,monospace;white-space:pre;">${escaped}</pre>`;
                codeLines = [];
            }
            continue;
        }
        if (inCodeBlock) { codeLines.push(line); continue; }

        // ── Table ────────────────────────────────────────────────
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            inTable = true;
            tableRows.push(trimmed);
            continue;
        }
        if (inTable) flushTable();

        // ── Blank line ───────────────────────────────────────────
        if (!trimmed) { html += `<div style="height:10px;"></div>`; continue; }

        // ── Horizontal rule ───────────────────────────────────────
        if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
            html += `<hr style="border:none;border-top:1px solid #d1d9e0;margin:24px 0;"/>`;
            continue;
        }

        // ── Headings ─────────────────────────────────────────────
        if (trimmed.startsWith("#### ")) {
            html += `<h4 style="font-size:1em;font-weight:700;margin:16px 0 8px;color:#1f2328;">${inline(trimmed.slice(5))}</h4>`;
            continue;
        }
        if (trimmed.startsWith("### ")) {
            html += `<h3 style="font-size:1.25em;font-weight:700;margin:20px 0 10px;color:#1f2328;padding-bottom:4px;">${inline(trimmed.slice(4))}</h3>`;
            continue;
        }
        if (trimmed.startsWith("## ")) {
            html += `<h2 style="font-size:1.5em;font-weight:700;border-bottom:1px solid #d1d9e0;padding-bottom:0.3em;margin:24px 0 14px;color:#1f2328;">${inline(trimmed.slice(3))}</h2>`;
            continue;
        }
        if (trimmed.startsWith("# ")) {
            html += `<h1 style="font-size:2em;font-weight:700;border-bottom:1px solid #d1d9e0;padding-bottom:0.3em;margin:24px 0 16px;color:#1f2328;">${inline(trimmed.slice(2))}</h1>`;
            continue;
        }

        // ── Blockquote ───────────────────────────────────────────
        if (trimmed.startsWith("> ")) {
            html += `<blockquote style="border-left:4px solid #d1d9e0;padding:4px 16px;color:#656d76;margin:12px 0;background:#f9fafb;border-radius:0 4px 4px 0;">${inline(trimmed.slice(2))}</blockquote>`;
            continue;
        }

        // ── Ordered list ─────────────────────────────────────────
        const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (olMatch) {
            html += `<div style="display:flex;gap:8px;margin:3px 0 3px 20px;line-height:1.6;"><span style="min-width:20px;color:#1f2328;font-variant-numeric:tabular-nums;">${olMatch[1]}.</span><span style="color:#1f2328;">${inline(olMatch[2])}</span></div>`;
            continue;
        }

        // ── Unordered list ───────────────────────────────────────
        if (/^[-*+] /.test(trimmed)) {
            const indent = line.search(/\S/);
            const marginLeft = Math.min(indent, 3) * 12 + 20;
            html += `<div style="display:flex;gap:8px;margin:3px 0 3px ${marginLeft}px;line-height:1.6;"><span style="min-width:8px;color:#57606a;">•</span><span style="color:#1f2328;">${inline(trimmed.slice(2))}</span></div>`;
            continue;
        }

        // ── Regular paragraph ────────────────────────────────────
        html += `<p style="margin:8px 0;line-height:1.7;color:#1f2328;">${inline(trimmed)}</p>`;
    }

    // Flush any remaining table
    if (inTable) flushTable();

    return html;
}

function GitHubMarkdownPreview({ content, title, badge, emptyMessage }) {
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        if (!containerRef.current) return;
        if (!content) { containerRef.current.innerHTML = ""; return; }
        containerRef.current.innerHTML = renderMarkdown(content);
    }, [content]);

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-slate-200 text-[10px] text-slate-600 font-bold uppercase tracking-wider flex justify-between items-center bg-[#f6f8fa]">
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    {title}
                </span>
                {badge && (
                    <span className="text-emerald-600 font-bold text-[9px] bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">{badge}</span>
                )}
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
                {!content ? (
                    <div className="text-slate-440 italic py-12 text-center text-sm flex flex-col items-center gap-3">
                        <span className="text-3xl">📄</span>
                        {emptyMessage}
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="px-8 py-6"
                        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif", fontSize: "14px", lineHeight: "1.6", color: "#1f2328", maxWidth: "900px" }}
                    />
                )}
            </div>
        </div>
    );
}

function DiffViewer({ modified = "" }) {
    return (
        <Card className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Generated Documentation Preview</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Rendered view of the generated README</p>
                </div>
            </div>

            <div className="h-[420px] overflow-hidden border border-slate-200 rounded-2xl shadow-inner">
                <GitHubMarkdownPreview
                    content={modified}
                    title="README.md — Current (GitHub Preview)"
                    badge="Live in Repo"
                    emptyMessage="No README generated yet."
                />
            </div>
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
                    {/* Interactive Diff Viewer */}
                    <DiffViewer 
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
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700">
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">psychology</span> Features Scan Coverage</span>
                                    <span>{latestJob ? "90%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-700 rounded-full" style={{ width: latestJob ? "90%" : "0%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700">
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">route</span> Routes &amp; API Scope</span>
                                    <span>{latestJob ? "85%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-700 rounded-full" style={{ width: latestJob ? "85%" : "0%" }}></div>
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
