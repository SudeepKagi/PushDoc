import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { 
    ArrowLeft, Play, RefreshCw, CheckCircle2, Clock, FileText, 
    Lock, Unlock, Sparkles, Terminal, Code2, GitCommit, 
    Copy, Check, Eye, GitCompare, FileCode, ExternalLink, AlertCircle
} from "lucide-react";

/**
 * Signature Element: Commit-Graph Pipeline Trail
 * Stages: queued -> analyzing -> generating -> validating -> committed
 */
function CommitGraphStatus({ status }) {
    const stages = [
        { key: "queued", label: "Queued", states: ["QUEUED"] },
        { key: "analyzing", label: "Analyzing", states: ["CLONING", "READING"] },
        { key: "generating", label: "Generating", states: ["GENERATING", "WRITING"] },
        { key: "validating", label: "Validating", states: ["VALIDATING", "CRITIQUE"] },
        { key: "committed", label: "Committed", states: ["COMMITTING", "PUSHING", "COMPLETED"] },
    ];

    const currentStageIndex = stages.findIndex(stage => stage.states.includes(status));
    const isCompleted = status === "COMPLETED";
    const isFailed = status === "FAILED";

    const activeIndex = isCompleted ? stages.length - 1 : currentStageIndex >= 0 ? currentStageIndex : 0;

    return (
        <div className="bg-surface-raised rounded-[6px] p-4 mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-mono font-medium text-text-primary">Generation Pipeline</span>
                </div>
                <Badge variant={isFailed ? "destructive" : isCompleted ? "success" : "default"} className="font-mono text-xs">
                    {status || "QUEUED"}
                </Badge>
            </div>

            {/* Commit Graph Trail */}
            <div className="relative flex items-center justify-between px-6 py-4">
                {/* Connecting Line */}
                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />

                {stages.map((stage, idx) => {
                    const isPassed = idx < activeIndex || isCompleted;
                    const isCurrent = idx === activeIndex && !isCompleted && !isFailed;
                    const isFuture = idx > activeIndex && !isCompleted;

                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2">
                            {/* Commit Node Dot */}
                            <div 
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                                    isCurrent 
                                        ? "bg-accent border-2 border-accent shadow-[0_0_0_4px_rgba(79,191,174,0.25)]" 
                                        : isPassed 
                                            ? "bg-accent border-2 border-accent" 
                                            : "bg-surface border-2 border-text-muted"
                                }`}
                            />

                            {/* Stage Label */}
                            <span className={`text-xs font-mono ${
                                isCurrent 
                                    ? "text-text-primary font-semibold" 
                                    : isPassed 
                                        ? "text-text-primary" 
                                        : "text-text-muted"
                            }`}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Real Diff Viewer with Semantic Tints and Gutter Border
 */
function DiffViewer({ original = "", generated = "" }) {
    if (!original && !generated) {
        return (
            <div className="p-8 text-center text-xs font-mono text-text-muted">
                No diff data available.
            </div>
        );
    }

    const origLines = (original || "").split("\n");
    const genLines = (generated || "").split("\n");

    return (
        <div className="bg-bg rounded-[6px] overflow-hidden diff-view">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Original README Column */}
                <div className="flex flex-col h-[500px]">
                    <div className="px-3 py-2 bg-surface-raised border-b border-border flex items-center justify-between">
                        <span className="text-xs font-mono text-text-secondary font-medium">Original README</span>
                        <Badge variant="secondary" className="text-xs font-mono">{origLines.length} lines</Badge>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                        {origLines.map((line, i) => (
                            <div key={i} className="flex items-start text-xs font-mono">
                                <span className="w-8 text-right pr-2 text-text-muted border-r border-border select-none shrink-0">
                                    {i + 1}
                                </span>
                                <span className="pl-2 whitespace-pre-wrap text-text-secondary">
                                    {line || " "}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Generated README Column with Real Diff Tints */}
                <div className="flex flex-col h-[500px]">
                    <div className="px-3 py-2 bg-surface-raised border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            <span className="text-xs font-mono text-text-primary font-medium">Synthesized README</span>
                        </div>
                        <Badge variant="accent" className="text-xs font-mono">{genLines.length} lines</Badge>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                        {genLines.map((line, i) => {
                            const isAdded = !origLines.includes(line);
                            return (
                                <div 
                                    key={i} 
                                    className={`flex items-start text-xs font-mono ${
                                        isAdded ? "diff-line-add" : "text-text-primary"
                                    }`}
                                >
                                    <span className="w-8 text-right pr-2 text-text-muted border-r border-border select-none shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="pl-2 whitespace-pre-wrap">
                                        {line || " "}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderMarkdown(rawContent) {
    if (!rawContent) return "";
    const content = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = content.split("\n");
    let html = "";
    let inCodeBlock = false;
    let codeLines = [];
    let inTable = false;
    let tableRows = [];

    const inline = (text) => {
        let t = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" style="display:inline;max-height:20px;margin:2px 3px 0;vertical-align:middle;" loading="lazy"/>');
        t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-accent hover:underline font-medium" target="_blank" rel="noopener">$1</a>');
        t = t.replace(/`([^`]+)`/g,
            '<code class="bg-surface-raised text-text-primary px-1.5 py-0.5 rounded-[4px] text-xs font-mono">$1</code>');
        t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
        t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        return t;
    };

    const flushTable = () => {
        if (tableRows.length < 2) { tableRows = []; inTable = false; return; }
        const headerCells = tableRows[0]
            .split("|").filter(c => c.trim())
            .map(c => `<th class="p-2 border-b border-border font-semibold bg-surface-raised text-left text-xs">${inline(c.trim())}</th>`)
            .join("");
        const bodyHtml = tableRows.slice(2)
            .filter(r => r.trim() && r.includes("|"))
            .map(row =>
                `<tr class="border-b border-border/50">${row.split("|").filter(c => c.trim())
                    .map(c => `<td class="p-2 align-top text-xs font-sans">${inline(c.trim())}</td>`)
                    .join("")}</tr>`
            ).join("");
        html += `<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse"><thead><tr>${headerCells}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
        tableRows = []; inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            if (inTable) flushTable();
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLines = [];
            } else {
                inCodeBlock = false;
                const escaped = codeLines.join("\n")
                    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<pre class="bg-surface-raised p-3 rounded-[6px] overflow-x-auto text-xs font-mono my-3 leading-relaxed text-text-primary">${escaped}</pre>`;
                codeLines = [];
            }
            continue;
        }
        if (inCodeBlock) { codeLines.push(line); continue; }

        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            inTable = true;
            tableRows.push(trimmed);
            continue;
        }
        if (inTable) flushTable();

        if (!trimmed) { html += `<div class="h-2"></div>`; continue; }

        if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
            html += `<hr class="my-4 border-border"/>`;
            continue;
        }

        if (trimmed.startsWith("#### ")) {
            html += `<h4 class="text-xs font-semibold my-2 text-text-primary">${inline(trimmed.slice(5))}</h4>`;
            continue;
        }
        if (trimmed.startsWith("### ")) {
            html += `<h3 class="text-sm font-semibold my-3 text-text-primary">${inline(trimmed.slice(4))}</h3>`;
            continue;
        }
        if (trimmed.startsWith("## ")) {
            html += `<h2 class="text-base font-semibold border-b border-border pb-1 my-3 text-text-primary">${inline(trimmed.slice(3))}</h2>`;
            continue;
        }
        if (trimmed.startsWith("# ")) {
            html += `<h1 class="text-lg font-semibold border-b border-border pb-1.5 my-3 text-text-primary">${inline(trimmed.slice(2))}</h1>`;
            continue;
        }

        if (trimmed.startsWith("> ")) {
            html += `<blockquote class="border-l-2 border-accent pl-3 text-text-secondary italic my-2 text-xs">${inline(trimmed.slice(2))}</blockquote>`;
            continue;
        }

        const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (olMatch) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="font-mono text-text-muted">${olMatch[1]}.</span><span>${inline(olMatch[2])}</span></div>`;
            continue;
        }

        if (/^[-*+] /.test(trimmed)) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="text-text-muted">•</span><span>${inline(trimmed.slice(2))}</span></div>`;
            continue;
        }

        html += `<p class="my-1.5 text-xs leading-relaxed text-text-primary">${inline(trimmed)}</p>`;
    }

    if (inTable) flushTable();
    return html;
}

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild, jobs = [] }) {
    if (!selectedRepo) return null;

    const [isTriggering, setIsTriggering] = useState(false);
    const [activeTab, setActiveTab] = useState("preview");
    const [copied, setCopied] = useState(false);

    const latestJob = jobs.find(j => j.repository?._id === selectedRepo._id);
    const isRunning = isTriggering || (latestJob && ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(latestJob.status));

    const handleManualTrigger = async () => {
        setIsTriggering(true);
        try {
            await triggerManualBuild(selectedRepo._id);
        } finally {
            setTimeout(() => setIsTriggering(false), 3000);
        }
    };

    const handleCopy = () => {
        if (!latestJob?.generatedReadme) return;
        navigator.clipboard.writeText(latestJob.generatedReadme);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayDuration = latestJob?.duration ? (latestJob.duration / 1000).toFixed(1) + "s" : "N/A";
    const displayLastRun = latestJob?.completedAt 
        ? new Date(latestJob.completedAt).toLocaleString("en-GB", { hour12: false }) 
        : "Never scanned";

    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || activeTab !== "preview") return;
        containerRef.current.innerHTML = renderMarkdown(latestJob?.generatedReadme || "");
    }, [latestJob?.generatedReadme, activeTab]);

    const activeStatus = isTriggering ? "QUEUED" : latestJob?.status;

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-4 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-0 text-xs text-text-secondary hover:text-text-primary h-6 mb-1"
                        onClick={() => setPage("dashboard")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Repositories</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary font-mono">{selectedRepo.name}</h1>
                        <Badge variant="outline" className="text-xs font-normal gap-1 font-mono">
                            {selectedRepo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {selectedRepo.private ? "Private" : "Public"}
                        </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 font-mono">{selectedRepo.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                    {latestJob?.generatedReadme && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-medium h-8 rounded-[6px]"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copied ? "Copied" : "Copy README"}</span>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="gap-1.5 font-medium text-xs h-8 rounded-[6px]"
                        onClick={handleManualTrigger}
                        disabled={isRunning}
                    >
                        {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        <span>{isRunning ? "Running..." : "Trigger Scan"}</span>
                    </Button>
                </div>
            </div>

            {/* Signature Element: Commit-Graph Pipeline Trail */}
            {(isTriggering || (latestJob && latestJob.status !== "COMPLETED" && latestJob.status !== "FAILED")) && (
                <CommitGraphStatus status={activeStatus || "QUEUED"} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Review & Preview Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-surface rounded-[6px]">
                        <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row items-center justify-between gap-2">
                            {/* Tab Switcher */}
                            <div className="flex items-center gap-1 bg-bg p-0.5 rounded-[4px]">
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-sans rounded-[4px] transition-colors ${
                                        activeTab === "preview" 
                                            ? "bg-surface text-text-primary font-semibold" 
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                >
                                    <Eye className="h-3 w-3" />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("diff")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-sans rounded-[4px] transition-colors ${
                                        activeTab === "diff" 
                                            ? "bg-surface text-text-primary font-semibold" 
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                >
                                    <GitCompare className="h-3 w-3" />
                                    <span>Review Diff</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("raw")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-sans rounded-[4px] transition-colors ${
                                        activeTab === "raw" 
                                            ? "bg-surface text-text-primary font-semibold" 
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                >
                                    <FileCode className="h-3 w-3" />
                                    <span>Raw Markdown</span>
                                </button>
                            </div>

                            <Badge variant="secondary" className="text-xs font-mono hidden sm:inline-flex">
                                GitHub Markdown
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-4">
                            {!latestJob?.generatedReadme ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center text-text-secondary">
                                    <FileText className="h-8 w-8 mb-2 opacity-40 text-text-muted" />
                                    <p className="text-xs font-medium text-text-primary">No README generated yet</p>
                                    <p className="text-xs text-text-muted mt-1">Click Trigger Scan above to generate documentation.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === "preview" && (
                                        <div className="h-[500px] overflow-y-auto pr-2 font-sans">
                                            <div ref={containerRef} className="text-xs leading-relaxed text-text-primary" />
                                        </div>
                                    )}

                                    {activeTab === "diff" && (
                                        <DiffViewer 
                                            original={latestJob?.originalReadme} 
                                            generated={latestJob?.generatedReadme} 
                                        />
                                    )}

                                    {activeTab === "raw" && (
                                        <div className="h-[500px] overflow-y-auto">
                                            <pre className="p-3 bg-bg rounded-[6px] text-xs font-mono whitespace-pre-wrap leading-relaxed text-text-primary">
                                                {latestJob?.generatedReadme}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Properties */}
                <div className="space-y-4">
                    <Card className="bg-surface rounded-[6px]">
                        <CardHeader className="p-3 pb-2 border-b border-border bg-surface-raised">
                            <CardTitle className="text-xs font-semibold text-text-primary">Repository Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 text-xs font-sans">
                            <div className="flex justify-between items-center py-1 border-b border-border">
                                <span className="text-text-secondary">Default Branch</span>
                                <Badge variant="secondary" className="font-mono text-xs">{selectedRepo.branch || "main"}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border">
                                <span className="text-text-secondary">Last Scanned</span>
                                <span className="font-mono text-text-primary">{displayLastRun}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border">
                                <span className="text-text-secondary">Scan Duration</span>
                                <span className="font-mono text-text-primary">{displayDuration}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-text-secondary">Auto-Commit</span>
                                <Badge variant={selectedRepo.isActive ? "success" : "secondary"} className="font-mono text-xs">
                                    {selectedRepo.isActive ? "Active" : "Disabled"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px]">
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-semibold text-text-primary">Review Mode</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs text-text-secondary leading-relaxed font-sans">
                            PushDoc generates README diffs directly from Git commits. Review changes side-by-side in the diff tab before push verification.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
