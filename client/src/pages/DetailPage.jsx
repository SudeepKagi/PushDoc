import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { 
    ArrowLeft, Play, RefreshCw, CheckCircle2, Clock, FileText, 
    Lock, Unlock, Sparkles, Terminal, Code2, GitCommit, 
    AlertCircle, Copy, Check, Eye, GitCompare, FileCode, ExternalLink
} from "lucide-react";

function ProgressTracker({ status }) {
    const steps = [
        { label: "Queued", icon: Clock, desc: "Pipeline job queued in worker queue", states: ["QUEUED"] },
        { label: "Cloning", icon: Terminal, desc: "Shallow cloning git commit diff", states: ["CLONING"] },
        { label: "AST Analyzing", icon: Code2, desc: "Extracting Express routes & database schemas", states: ["READING"] },
        { label: "AI Writing", icon: Sparkles, desc: "Synthesizing documentation with grounded facts", states: ["GENERATING", "WRITING"] },
        { label: "Committing", icon: FileText, desc: "Formatting README markdown artifact", states: ["COMMITTING"] },
        { label: "Pushing", icon: GitCommit, desc: "Pushing README commit to repository", states: ["PUSHING"] },
    ];

    const currentStepIndex = steps.findIndex(step => step.states.includes(status));
    const isCompleted = status === "COMPLETED";
    const isFailed = status === "FAILED";

    const activeStepObj = steps[currentStepIndex] || steps[0];
    const progressPercent = isCompleted ? 100 : Math.max(10, Math.round(((currentStepIndex + 1) / steps.length) * 100));

    return (
        <Card className="mb-6 border-border shadow-none glass-panel">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/70">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Pipeline Processing Status</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Real-time repository scanning, AST parsing & AI generation</CardDescription>
                    </div>
                </div>
                <Badge variant={isFailed ? "destructive" : isCompleted ? "success" : "default"} className="text-xs font-mono font-normal gap-1.5 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    {status}
                </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
                {/* Progress bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                    </div>
                </div>

                {/* Step grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isActive = idx === currentStepIndex;
                        const isPassed = idx < currentStepIndex || isCompleted;

                        return (
                            <div 
                                key={idx} 
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    isActive 
                                        ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/30" 
                                        : isPassed 
                                            ? "bg-muted/40 border-border text-foreground" 
                                            : "bg-card/40 border-border/50 text-muted-foreground opacity-60"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <StepIcon className={`h-4 w-4 ${isActive ? "text-primary animate-pulse" : isPassed ? "text-emerald-500" : "text-muted-foreground"}`} />
                                    {isPassed ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <span className="text-[10px] font-mono text-muted-foreground">0{idx + 1}</span>
                                    )}
                                </div>
                                <div className="text-xs font-medium tracking-tight truncate">{step.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Live Action Banner */}
                <div className="p-3 bg-muted/60 rounded-md border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-foreground font-mono">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>{activeStepObj.desc}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">Processing in worker thread...</span>
                </div>
            </CardContent>
        </Card>
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
            '<img src="$2" alt="$1" style="display:inline;max-height:24px;margin:2px 3px 0;vertical-align:middle;" loading="lazy"/>');
        t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-primary underline font-medium" target="_blank" rel="noopener">$1</a>');
        t = t.replace(/`([^`]+)`/g,
            '<code class="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono border border-border">$1</code>');
        t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
        t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        return t;
    };

    const flushTable = () => {
        if (tableRows.length < 2) { tableRows = []; inTable = false; return; }
        const headerCells = tableRows[0]
            .split("|").filter(c => c.trim())
            .map(c => `<th class="p-2 border border-border font-semibold bg-muted text-left text-xs">${inline(c.trim())}</th>`)
            .join("");
        const bodyHtml = tableRows.slice(2)
            .filter(r => r.trim() && r.includes("|"))
            .map(row =>
                `<tr>${row.split("|").filter(c => c.trim())
                    .map(c => `<td class="p-2 border border-border align-top text-xs">${inline(c.trim())}</td>`)
                    .join("")}</tr>`
            ).join("");
        html += `<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse border border-border"><thead><tr>${headerCells}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
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
                html += `<pre class="bg-muted/80 p-4 rounded-md overflow-x-auto text-xs font-mono border border-border my-3 leading-relaxed">${escaped}</pre>`;
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
            html += `<hr class="my-4 border-border/80"/>`;
            continue;
        }

        if (trimmed.startsWith("#### ")) {
            html += `<h4 class="text-sm font-semibold my-2 text-foreground">${inline(trimmed.slice(5))}</h4>`;
            continue;
        }
        if (trimmed.startsWith("### ")) {
            html += `<h3 class="text-base font-semibold my-3 text-foreground">${inline(trimmed.slice(4))}</h3>`;
            continue;
        }
        if (trimmed.startsWith("## ")) {
            html += `<h2 class="text-lg font-bold border-b border-border pb-1 my-4 text-foreground">${inline(trimmed.slice(3))}</h2>`;
            continue;
        }
        if (trimmed.startsWith("# ")) {
            html += `<h1 class="text-xl font-extrabold border-b border-border pb-1.5 my-4 text-foreground">${inline(trimmed.slice(2))}</h1>`;
            continue;
        }

        if (trimmed.startsWith("> ")) {
            html += `<blockquote class="border-l-2 border-primary pl-4 text-muted-foreground italic my-2">${inline(trimmed.slice(2))}</blockquote>`;
            continue;
        }

        const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (olMatch) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="font-mono text-muted-foreground">${olMatch[1]}.</span><span>${inline(olMatch[2])}</span></div>`;
            continue;
        }

        if (/^[-*+] /.test(trimmed)) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="text-muted-foreground">•</span><span>${inline(trimmed.slice(2))}</span></div>`;
            continue;
        }

        html += `<p class="my-2 text-xs leading-relaxed text-foreground">${inline(trimmed)}</p>`;
    }

    if (inTable) flushTable();
    return html;
}

function DiffViewer({ original = "", generated = "" }) {
    if (!original && !generated) {
        return <div className="p-8 text-center text-xs text-muted-foreground">No diff data available.</div>;
    }

    const origLines = (original || "").split("\n");
    const genLines = (generated || "").split("\n");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[550px] overflow-hidden text-xs font-mono">
            {/* Original */}
            <div className="flex flex-col h-full rounded-md border border-border/80 bg-background/50 overflow-hidden">
                <div className="p-2.5 bg-muted/70 border-b border-border font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Original README</span>
                    <Badge variant="outline" className="text-[10px]">{origLines.length} lines</Badge>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-0.5 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {original || "(No original README found in repository)"}
                </div>
            </div>

            {/* Generated */}
            <div className="flex flex-col h-full rounded-md border border-primary/30 bg-primary/5 overflow-hidden">
                <div className="p-2.5 bg-primary/10 border-b border-primary/20 font-semibold text-primary flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Grounded AI Generation</span>
                    <Badge variant="default" className="text-[10px]">{genLines.length} lines</Badge>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-0.5 whitespace-pre-wrap leading-relaxed text-foreground">
                    {generated || "(README has not been generated yet)"}
                </div>
            </div>
        </div>
    );
}

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild, jobs = [] }) {
    if (!selectedRepo) return null;

    const [isTriggering, setIsTriggering] = useState(false);
    const [activeTab, setActiveTab] = useState("preview"); // "preview" | "diff" | "raw"
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
        <div className="space-y-6 max-w-7xl mx-auto py-4 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-0 text-xs text-muted-foreground hover:text-foreground h-7 mb-1"
                        onClick={() => setPage("dashboard")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Repositories</span>
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{selectedRepo.name}</h1>
                        <Badge variant="outline" className="text-xs font-normal gap-1">
                            {selectedRepo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {selectedRepo.private ? "Private" : "Public"}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{selectedRepo.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                    {latestJob?.generatedReadme && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-medium"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copied ? "Copied!" : "Copy README"}</span>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="gap-2 font-medium glow-primary"
                        onClick={handleManualTrigger}
                        disabled={isRunning}
                    >
                        {isRunning ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Play className="h-4 w-4" />}
                        <span>{isRunning ? "Running Pipeline..." : "Trigger Manual Scan"}</span>
                    </Button>
                </div>
            </div>

            {/* Live Progress Tracker */}
            {(isTriggering || (latestJob && latestJob.status !== "COMPLETED" && latestJob.status !== "FAILED")) && (
                <ProgressTracker status={activeStatus || "QUEUED"} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Review & Preview Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-none border-border glass-panel">
                        <CardHeader className="p-4 pb-3 border-b border-border/80 flex flex-row items-center justify-between gap-2">
                            {/* Tab Switcher */}
                            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        activeTab === "preview" 
                                            ? "bg-card text-foreground shadow-sm font-semibold" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("diff")}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        activeTab === "diff" 
                                            ? "bg-card text-foreground shadow-sm font-semibold" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <GitCompare className="h-3.5 w-3.5" />
                                    <span>Review Diff</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("raw")}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        activeTab === "raw" 
                                            ? "bg-card text-foreground shadow-sm font-semibold" 
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <FileCode className="h-3.5 w-3.5" />
                                    <span>Raw Markdown</span>
                                </button>
                            </div>

                            <Badge variant="secondary" className="text-xs font-normal font-mono hidden sm:inline-flex">
                                GitHub Markdown
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-6">
                            {!latestJob?.generatedReadme ? (
                                <div className="h-[450px] flex flex-col items-center justify-center text-center text-muted-foreground">
                                    <FileText className="h-10 w-10 mb-2 opacity-50 text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">No README generated yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Click Trigger Manual Scan above to generate documentation.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === "preview" && (
                                        <div className="h-[550px] overflow-y-auto pr-2">
                                            <div ref={containerRef} className="prose dark:prose-invert max-w-none text-xs" />
                                        </div>
                                    )}

                                    {activeTab === "diff" && (
                                        <DiffViewer 
                                            original={latestJob?.originalReadme} 
                                            generated={latestJob?.generatedReadme} 
                                        />
                                    )}

                                    {activeTab === "raw" && (
                                        <div className="h-[550px] overflow-y-auto">
                                            <pre className="p-4 bg-muted/80 rounded-md text-xs font-mono whitespace-pre-wrap border border-border leading-relaxed text-foreground">
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
                <div className="space-y-6">
                    <Card className="shadow-none border-border glass-panel">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold">Repository Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border/80">
                                <span className="text-muted-foreground">Default Branch</span>
                                <Badge variant="secondary" className="font-mono text-xs">{selectedRepo.branch || "main"}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-border/80">
                                <span className="text-muted-foreground">Last Scanned</span>
                                <span className="font-medium text-foreground">{displayLastRun}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-border/80">
                                <span className="text-muted-foreground">Scan Duration</span>
                                <span className="font-medium text-foreground">{displayDuration}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">Auto-Commit on Push</span>
                                <Badge variant={selectedRepo.isActive ? "success" : "secondary"}>
                                    {selectedRepo.isActive ? "Active" : "Disabled"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border glass-panel">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold">Automation & Review Mode</CardTitle>
                            <CardDescription className="text-xs">Review before committing</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
                            <p>
                                When pushes arrive, PushDoc analyzes AST structures and synthesizes documentation. You can review the diff side-by-side before manual or automated commits.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
