import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { fetchRepoReadme, cancelJob, fetchJobLogs } from "../utils/api.js";
import { 
    ArrowLeft, Play, RefreshCw, CheckCircle2, Clock, FileText, 
    Lock, Unlock, Sparkles, Terminal, Code2, GitCommit, 
    Copy, Check, Eye, GitCompare, FileCode, ExternalLink, AlertCircle,
    Power, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Square
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
    const isCancelled = status === "CANCELLED";

    const activeIndex = isCompleted ? stages.length - 1 : currentStageIndex >= 0 ? currentStageIndex : 0;

    return (
        <div className="bg-surface-raised rounded-[6px] p-4 mb-6 space-y-4 border border-border w-full min-w-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isFailed ? "bg-destructive" : isCancelled ? "bg-text-muted" : isCompleted ? "bg-success" : "bg-accent animate-pulse"}`} />
                    <span className="text-xs font-mono font-medium text-text-primary">Generation Pipeline</span>
                </div>
                <Badge variant={isFailed ? "destructive" : isCancelled ? "secondary" : isCompleted ? "success" : "default"} className="font-mono text-xs">
                    {status || "QUEUED"}
                </Badge>
            </div>

            {/* Commit Graph Trail */}
            <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 overflow-x-auto min-w-0">
                {/* Connecting Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />

                {stages.map((stage, idx) => {
                    const isPassed = idx < activeIndex || isCompleted;
                    const isCurrent = idx === activeIndex && !isCompleted && !isFailed;

                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2 shrink-0">
                            {/* Commit Node Dot */}
                            <div 
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                                    isFailed && idx === activeIndex
                                        ? "bg-destructive border-2 border-destructive"
                                        : isCurrent 
                                            ? "bg-accent border-2 border-accent shadow-[0_0_0_4px_rgba(79,191,174,0.25)] animate-pulse" 
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
function DiffViewer({ original = "", generated = "", onTriggerScan, isRunning = false }) {
    const origLines = (original || "").split("\n");
    const genLines = (generated || "").split("\n");

    return (
        <div className="bg-bg rounded-[6px] overflow-hidden diff-view border border-border w-full min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Original README Column */}
                <div className="flex flex-col h-[520px] min-w-0">
                    <div className="px-3 py-2 bg-surface-raised border-b border-border flex items-center justify-between">
                        <span className="text-xs font-mono text-text-secondary font-medium">Original README</span>
                        <Badge variant="secondary" className="text-xs font-mono">{original ? `${origLines.length} lines` : "Empty"}</Badge>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-0.5 min-w-0">
                        {original ? (
                            origLines.map((line, i) => (
                                <div key={i} className="flex items-start text-xs font-mono">
                                    <span className="w-8 text-right pr-2 text-text-muted border-r border-border select-none shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="pl-2 whitespace-pre-wrap break-all text-text-secondary">
                                        {line || " "}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs font-mono text-text-muted">
                                No original README found on repository.
                            </div>
                        )}
                    </div>
                </div>

                {/* Generated README Column with Real Diff Tints */}
                <div className="flex flex-col h-[520px] min-w-0">
                    <div className="px-3 py-2 bg-surface-raised border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            <span className="text-xs font-mono text-text-primary font-medium">Synthesized README</span>
                        </div>
                        <Badge variant="accent" className="text-xs font-mono">{generated ? `${genLines.length} lines` : "Pending"}</Badge>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-0.5 min-w-0">
                        {generated ? (
                            genLines.map((line, i) => {
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
                                        <span className="pl-2 whitespace-pre-wrap break-all">
                                            {line || " "}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                                <FileText className="h-8 w-8 text-text-muted opacity-40" />
                                <p className="text-xs text-text-secondary">No synthesized README generated yet.</p>
                                <Button 
                                    size="sm" 
                                    disabled={isRunning} 
                                    className="gap-1.5 text-xs h-7 rounded-[6px]"
                                    onClick={onTriggerScan}
                                >
                                    <Play className="h-3 w-3" />
                                    <span>Synthesize Now</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Robust markdown-to-HTML parser with non-overflowing table layout
 */
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

        // Images / Shields
        t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" class="max-h-6 inline-block align-middle my-0.5 mr-1" loading="lazy"/>');

        // Links
        t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-accent hover:underline font-medium break-all" target="_blank" rel="noopener">$1</a>');

        // Inline code
        t = t.replace(/`([^`]+)`/g,
            '<code class="bg-surface-raised text-text-primary px-1.5 py-0.5 rounded-[4px] text-[11px] font-mono break-all">$1</code>');

        // Bold & Italic
        t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
        t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");

        // Restore HTML linebreaks if present
        t = t.replace(/&lt;br\s*\/?&gt;/gi, "<br/>");

        return t;
    };

    const flushTable = () => {
        if (tableRows.length === 0) { inTable = false; return; }

        const parseRow = (rowStr) => {
            let cells = rowStr.trim().split("|");
            if (cells[0] === "") cells.shift();
            if (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
            return cells;
        };

        // If only 1 row or no separator row, render as clean navigation pills
        if (tableRows.length === 1 || (tableRows.length === 2 && !tableRows[1].includes("-"))) {
            const items = parseRow(tableRows[0]).filter(c => c.trim());
            html += `<div class="flex flex-wrap gap-2 my-3 p-2 bg-surface-raised/60 rounded-[6px] border border-border/50">${
                items.map(item => `<span class="px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary rounded-[4px] border border-border/60 shadow-xs">${inline(item.trim())}</span>`).join("")
            }</div>`;
            tableRows = [];
            inTable = false;
            return;
        }

        const rawRows = tableRows.map(parseRow);
        const maxCols = Math.max(...rawRows.map(r => r.length), 1);
        const hasSeparator = tableRows.length > 1 && /^\|?(\s*:?-+:?\s*\|?)+$/.test(tableRows[1].trim());
        const headerRow = rawRows[0];
        const bodyRows = hasSeparator ? rawRows.slice(2) : rawRows.slice(1);

        const headerHtml = headerRow.map((c) => {
            const colspan = (headerRow.length === 1 && maxCols > 1) ? ` colspan="${maxCols}"` : "";
            return `<th${colspan} class="p-2.5 border-b border-border font-semibold bg-surface-raised text-left text-xs text-text-primary whitespace-nowrap" style="min-width: 140px;">${inline(c.trim())}</th>`;
        }).join("");

        const bodyHtml = bodyRows.map(row => {
            if (row.length === 0 || row.every(c => !c.trim())) return "";
            while (row.length < maxCols) row.push("");
            return `<tr class="border-b border-border/40 hover:bg-surface-raised/40 transition-colors">${
                row.map(c => `<td class="p-2.5 align-top text-xs font-sans text-text-secondary whitespace-normal break-words" style="min-width: 140px; max-width: 340px;">${inline(c.trim()) || "&nbsp;"}</td>`).join("")
            }</tr>`;
        }).filter(Boolean).join("");

        html += `<div class="w-full my-4 overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm" style="max-width: 100%;"><table class="w-full text-xs border-collapse table-auto" style="min-width: max-content;"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
        tableRows = []; 
        inTable = false;
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
                html += `<pre class="bg-surface-raised p-3.5 rounded-[6px] overflow-x-auto text-xs font-mono my-3 leading-relaxed text-text-primary border border-border w-full">${escaped}</pre>`;
                codeLines = [];
            }
            continue;
        }
        if (inCodeBlock) { codeLines.push(line); continue; }

        if (trimmed.startsWith("|") && (trimmed.endsWith("|") || trimmed.includes("|"))) {
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
            html += `<h4 class="text-xs font-semibold my-2 text-text-primary tracking-tight">${inline(trimmed.slice(5))}</h4>`;
            continue;
        }
        if (trimmed.startsWith("### ")) {
            html += `<h3 class="text-sm font-semibold my-3 text-text-primary tracking-tight">${inline(trimmed.slice(4))}</h3>`;
            continue;
        }
        if (trimmed.startsWith("## ")) {
            html += `<h2 class="text-base font-semibold border-b border-border pb-1 my-3 text-text-primary tracking-tight">${inline(trimmed.slice(3))}</h2>`;
            continue;
        }
        if (trimmed.startsWith("# ")) {
            html += `<h1 class="text-lg font-semibold border-b border-border pb-1.5 my-3 text-text-primary tracking-tight">${inline(trimmed.slice(2))}</h1>`;
            continue;
        }

        if (trimmed.startsWith("> ")) {
            html += `<blockquote class="border-l-2 border-accent pl-3 text-text-secondary italic my-2 text-xs">${inline(trimmed.slice(2))}</blockquote>`;
            continue;
        }

        const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (olMatch) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="font-mono text-text-muted shrink-0">${olMatch[1]}.</span><span>${inline(olMatch[2])}</span></div>`;
            continue;
        }

        if (/^[-*+] /.test(trimmed)) {
            html += `<div class="flex gap-2 my-1 text-xs leading-relaxed"><span class="text-accent shrink-0">•</span><span>${inline(trimmed.slice(2))}</span></div>`;
            continue;
        }

        html += `<p class="my-1.5 text-xs leading-relaxed text-text-primary break-words">${inline(trimmed)}</p>`;
    }

    if (inTable) flushTable();
    return html;
}

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild, toggleRepository, jobs = [], token, refreshJobs }) {
    const [isTriggering, setIsTriggering] = useState(false);
    const [activeTab, setActiveTab] = useState("preview");
    const [copied, setCopied] = useState(false);
    const [liveReadme, setLiveReadme] = useState("");
    const [loadingLiveReadme, setLoadingLiveReadme] = useState(false);
    const [isEnabling, setIsEnabling] = useState(false);

    // Robust ID matching between populated object and string ID
    const matchingJobs = useMemo(() => {
        return (jobs || []).filter(j => {
            const jRepoId = j.repository?._id?.toString() || j.repository?.toString();
            const sRepoId = selectedRepo?._id?.toString();
            return jRepoId === sRepoId;
        });
    }, [jobs, selectedRepo?._id]);

    // Pick latest job by creation date
    const latestJob = matchingJobs.length > 0 ? matchingJobs[0] : null;

    // Check if the current job is actively in progress
    const isJobActive = latestJob && ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(latestJob.status);
    const isRunning = isTriggering || isJobActive;

    // Fetch current live README from GitHub
    useEffect(() => {
        if (!selectedRepo?._id || !token) return;
        let isMounted = true;
        setLoadingLiveReadme(true);

        fetchRepoReadme(selectedRepo._id, token)
            .then((data) => {
                if (isMounted && data.success && data.readme) {
                    setLiveReadme(data.readme);
                }
            })
            .catch((err) => console.warn("Failed to fetch live repository README:", err))
            .finally(() => {
                if (isMounted) setLoadingLiveReadme(false);
            });

        return () => { isMounted = false; };
    }, [selectedRepo?._id, token]);

    // Active scan self-healing: refresh jobs every 3s while scan is running
    useEffect(() => {
        if (!isRunning || !refreshJobs) return;
        const interval = setInterval(() => {
            refreshJobs();
        }, 3000);
        return () => clearInterval(interval);
    }, [isRunning, refreshJobs]);

    // When latestJob reaches COMPLETED, clear isTriggering and immediately pull fresh README
    useEffect(() => {
        if (latestJob?.status === "COMPLETED" && selectedRepo?._id && token) {
            setIsTriggering(false);
            fetchRepoReadme(selectedRepo._id, token)
                .then(data => {
                    if (data?.success && data.readme) {
                        setLiveReadme(data.readme);
                    }
                })
                .catch(() => {});
        }
    }, [latestJob?.status, selectedRepo?._id, token]);

    const handleEnableRepository = async () => {
        if (!toggleRepository || !selectedRepo?._id) return;
        setIsEnabling(true);
        try {
            await toggleRepository(selectedRepo._id);
        } catch (err) {
            console.error("Failed to enable repository:", err);
        } finally {
            setIsEnabling(false);
        }
    };

    const handleManualTrigger = async () => {
        if (!selectedRepo.isActive) {
            if (toggleRepository) {
                setIsEnabling(true);
                try {
                    await toggleRepository(selectedRepo._id);
                } catch (err) {
                    console.error("Auto-enable repository error:", err);
                } finally {
                    setIsEnabling(false);
                }
            }
        }

        setIsTriggering(true);
        try {
            await triggerManualBuild(selectedRepo._id);
            if (refreshJobs) {
                await refreshJobs();
            }
        } catch (err) {
            console.error("Trigger manual build error:", err);
        } finally {
            setTimeout(() => setIsTriggering(false), 1500);
        }
    };

    const [isCancelling, setIsCancelling] = useState(false);
    const [showLogsDrawer, setShowLogsDrawer] = useState(false);
    const [jobLogs, setJobLogs] = useState([]);

    useEffect(() => {
        if (!latestJob?._id || !token) return;
        fetchJobLogs(latestJob._id, token)
            .then(data => {
                if (data && data.success) {
                    setJobLogs(data.logs || []);
                }
            })
            .catch(() => {});
    }, [latestJob?._id, latestJob?.status, token]);

    const handleCancelJob = async () => {
        if (!latestJob?._id || !token) return;
        setIsCancelling(true);
        try {
            await cancelJob(latestJob._id, token);
            if (refreshJobs) {
                await refreshJobs();
            }
        } catch (err) {
            console.error("Cancel job error:", err);
        } finally {
            setIsCancelling(false);
        }
    };

    // Active markdown content to display: synthesized README if available, otherwise live GitHub README
    const activeMarkdown = latestJob?.generatedReadme || liveReadme || "";
    const isSynthesized = !!latestJob?.generatedReadme;

    const handleCopy = () => {
        if (!activeMarkdown) return;
        navigator.clipboard.writeText(activeMarkdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayDuration = latestJob?.duration ? (latestJob.duration / 1000).toFixed(1) + "s" : isRunning ? "Running..." : "N/A";
    const displayLastRun = latestJob?.completedAt 
        ? new Date(latestJob.completedAt).toLocaleString("en-GB", { hour12: false }) 
        : "Not scanned yet";

    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || activeTab !== "preview") return;
        containerRef.current.innerHTML = renderMarkdown(activeMarkdown);
    }, [activeMarkdown, activeTab]);

    const activeStatus = isTriggering ? "QUEUED" : latestJob?.status;

    if (!selectedRepo) return null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2 font-sans w-full min-w-0 overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
                <div className="min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-0 text-xs text-text-secondary hover:text-text-primary h-6 mb-1"
                        onClick={() => setPage("dashboard")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Repositories</span>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary font-mono truncate">{selectedRepo.name}</h1>
                        <Badge variant="outline" className="text-xs font-normal gap-1 font-mono shrink-0">
                            {selectedRepo.private ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {selectedRepo.private ? "Private" : "Public"}
                        </Badge>
                        <Badge 
                            variant={selectedRepo.isActive ? "success" : "secondary"} 
                            className="text-[10px] font-mono cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                            onClick={handleEnableRepository}
                            title="Click to toggle active status"
                        >
                            {selectedRepo.isActive ? "Active" : "Disabled"}
                        </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 font-mono truncate">{selectedRepo.fullName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {activeMarkdown && (
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
                    {isRunning && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 font-medium text-xs h-8 rounded-[6px] text-destructive border-destructive/40 hover:bg-destructive/10"
                            onClick={handleCancelJob}
                            disabled={isCancelling}
                        >
                            <Square className="h-3 w-3 fill-current" />
                            <span>{isCancelling ? "Stopping..." : "Stop Process"}</span>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="gap-1.5 font-medium text-xs h-8 rounded-[6px]"
                        onClick={handleManualTrigger}
                        disabled={isRunning || isEnabling}
                    >
                        {isRunning || isEnabling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        <span>
                            {isEnabling ? "Enabling..." : isRunning ? "Running Scan..." : !selectedRepo.isActive ? "Enable & Synthesize" : isSynthesized ? "Re-synthesize README" : "Trigger Scan"}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Inactive Repository Warning Banner */}
            {!selectedRepo.isActive && (
                <div className="p-3.5 bg-warning/10 border border-warning/30 rounded-[6px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs w-full min-w-0">
                    <div className="flex items-center gap-2 text-warning min-w-0">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                            <span className="font-semibold text-text-primary">Repository is currently disabled. </span>
                            <span className="text-text-secondary">Enable this repository to trigger scans, synthesize READMEs, and receive automated commit syncs on push.</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="warning"
                        className="h-7 text-xs px-3 rounded-[4px] gap-1.5 shrink-0 font-medium"
                        onClick={handleEnableRepository}
                        disabled={isEnabling}
                    >
                        <Power className="h-3 w-3" />
                        <span>{isEnabling ? "Enabling..." : "Enable Repository"}</span>
                    </Button>
                </div>
            )}

            {/* Job Failure / Cancellation Banner */}
            {(latestJob?.status === "FAILED" || latestJob?.status === "CANCELLED") && !isRunning && (
                <div className={`p-3.5 ${latestJob.status === "CANCELLED" ? "bg-surface-raised border-border" : "bg-destructive/10 border-destructive/30"} border rounded-[6px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs w-full min-w-0`}>
                    <div className={`flex items-center gap-2 ${latestJob.status === "CANCELLED" ? "text-text-secondary" : "text-destructive"} min-w-0`}>
                        {latestJob.status === "CANCELLED" ? <AlertCircle className="h-4 w-4 shrink-0 text-text-muted" /> : <XCircle className="h-4 w-4 shrink-0" />}
                        <div className="min-w-0">
                            <span className="font-semibold text-text-primary">{latestJob.status === "CANCELLED" ? "Synthesis cancelled: " : "Synthesis failed: "}</span>
                            <span className="text-text-secondary font-mono">{latestJob.error || "Unknown execution failure"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5 rounded-[4px] gap-1 shrink-0 border-destructive/40 text-text-primary hover:bg-surface-raised"
                            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                        >
                            <Terminal className="h-3 w-3" />
                            <span>{showLogsDrawer ? "Hide Logs" : "View Error Logs"}</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-3 rounded-[4px] gap-1.5 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={handleManualTrigger}
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Retry Synthesis</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Error Logs Terminal Drawer */}
            {showLogsDrawer && (
                <div className="bg-bg border border-border rounded-[6px] overflow-hidden p-3 font-mono text-xs text-text-primary shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-semibold flex items-center gap-1.5 text-text-secondary">
                            <Terminal className="h-3.5 w-3.5 text-accent" />
                            Execution Logs (Job: {latestJob?.bullJobId || latestJob?._id})
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] px-2"
                            onClick={() => setShowLogsDrawer(false)}
                        >
                            Close
                        </Button>
                    </div>
                    <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-text-secondary bg-surface p-2.5 rounded-[4px]">
                        {jobLogs.length > 0 ? jobLogs.join("\n") : (latestJob?.error || "No logs recorded for this job execution.")}
                    </pre>
                </div>
            )}

            {/* Signature Element: Commit-Graph Pipeline Trail */}
            {(isTriggering || (latestJob && latestJob.status !== "COMPLETED")) && (
                <CommitGraphStatus status={activeStatus || "QUEUED"} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full min-w-0">
                {/* Main Review & Preview Card */}
                <div className="lg:col-span-2 space-y-6 min-w-0 w-full">
                    <Card className="bg-surface rounded-[6px] border border-border w-full min-w-0 overflow-hidden shadow-sm">
                        <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row flex-wrap items-center justify-between gap-2">
                            {/* Tab Switcher */}
                            <div className="flex items-center gap-1 bg-bg p-0.5 rounded-[4px]">
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-sans rounded-[4px] transition-colors ${
                                        activeTab === "preview" 
                                            ? "bg-surface text-text-primary font-semibold shadow-sm" 
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
                                            ? "bg-surface text-text-primary font-semibold shadow-sm" 
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
                                            ? "bg-surface text-text-primary font-semibold shadow-sm" 
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                >
                                    <FileCode className="h-3 w-3" />
                                    <span>Raw Markdown</span>
                                </button>
                            </div>

                            {isRunning ? (
                                <Badge variant="accent" className="text-xs font-mono gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                    <span>Pipeline in progress</span>
                                </Badge>
                            ) : isSynthesized ? (
                                <Badge variant="success" className="text-xs font-mono">
                                    AI Synthesized
                                </Badge>
                            ) : liveReadme ? (
                                <Badge variant="secondary" className="text-xs font-mono">
                                    Current GitHub README
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs font-mono">
                                    No README
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent className="p-4 min-w-0 w-full">
                            {isRunning ? (
                                <div className="h-[450px] flex flex-col justify-center space-y-4 p-6 animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-1/3 bg-surface-raised" />
                                        <Skeleton className="h-5 w-16 rounded-[4px] bg-surface-raised" />
                                    </div>
                                    <Skeleton className="h-4 w-full bg-surface-raised" />
                                    <Skeleton className="h-4 w-5/6 bg-surface-raised" />
                                    <div className="space-y-2 pt-4">
                                        <Skeleton className="h-5 w-1/4 bg-surface-raised" />
                                        <Skeleton className="h-16 w-full rounded-[6px] bg-surface-raised" />
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-5 w-1/3 bg-surface-raised" />
                                        <Skeleton className="h-4 w-3/4 bg-surface-raised" />
                                    </div>
                                </div>
                            ) : loadingLiveReadme ? (
                                <div className="h-[450px] flex items-center justify-center">
                                    <RefreshCw className="h-5 w-5 animate-spin text-accent" />
                                </div>
                            ) : !activeMarkdown ? (
                                <div className="h-[450px] flex flex-col items-center justify-center text-center text-text-secondary space-y-3">
                                    <FileText className="h-10 w-10 opacity-40 text-text-muted" />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">No README Found</p>
                                        <p className="text-xs text-text-muted mt-1">This repository currently has no README file on GitHub.</p>
                                    </div>
                                    <Button size="sm" onClick={handleManualTrigger} className="gap-1.5 text-xs h-8 rounded-[6px]">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Synthesize First README</span>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {!isSynthesized && (
                                        <div className="mb-3 p-2.5 bg-surface-raised rounded-[6px] border border-border flex items-center justify-between text-xs w-full min-w-0">
                                            <span className="text-text-secondary">
                                                Showing current live README from GitHub. Click <strong className="text-text-primary">Re-synthesize README</strong> to generate grounded documentation.
                                            </span>
                                        </div>
                                    )}

                                    {activeTab === "preview" && (
                                        <div className="h-[550px] overflow-y-auto overflow-x-auto pr-2 font-sans space-y-2 w-full min-w-0">
                                            <div ref={containerRef} className="text-xs leading-relaxed text-text-primary break-words w-full min-w-0" />
                                        </div>
                                    )}

                                    {activeTab === "diff" && (
                                        <DiffViewer 
                                            original={latestJob?.originalReadme || liveReadme} 
                                            generated={latestJob?.generatedReadme} 
                                            onTriggerScan={handleManualTrigger}
                                            isRunning={isRunning}
                                        />
                                    )}

                                    {activeTab === "raw" && (
                                        <div className="h-[550px] overflow-y-auto overflow-x-auto w-full min-w-0">
                                            <pre className="p-3 bg-bg rounded-[6px] text-xs font-mono whitespace-pre-wrap leading-relaxed text-text-primary border border-border w-full">
                                                {activeMarkdown}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Properties */}
                <div className="space-y-4 min-w-0 w-full lg:sticky lg:top-4">
                    <Card className="bg-surface rounded-[6px] border border-border w-full min-w-0 shadow-sm">
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
                                <span className="font-mono text-text-primary text-[11px]">{displayLastRun}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-border">
                                <span className="text-text-secondary">Scan Duration</span>
                                <span className="font-mono text-text-primary">{displayDuration}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-text-secondary">Repository Status</span>
                                <Button
                                    variant={selectedRepo.isActive ? "outline" : "default"}
                                    size="sm"
                                    className="h-6 text-[11px] px-2 rounded-[4px] gap-1 font-mono"
                                    onClick={handleEnableRepository}
                                    disabled={isEnabling}
                                >
                                    <Power className="h-3 w-3" />
                                    <span>{isEnabling ? "Updating..." : selectedRepo.isActive ? "Active" : "Enable"}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px] border border-border w-full min-w-0 shadow-sm">
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-xs font-semibold text-text-primary">Review Mode</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs text-text-secondary leading-relaxed font-sans">
                            PushDoc extracts common facts and generates README diffs directly from your codebase AST. Review additions in the diff tab before automatic push verification.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
