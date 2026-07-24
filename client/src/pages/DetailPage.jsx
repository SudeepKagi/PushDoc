import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { ArrowLeft, Play, RefreshCw, CheckCircle2, Clock, FileText, Lock, Unlock, Eye, Sparkles, Layers, Route } from "lucide-react";

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
        <Card className="mb-6 border-border shadow-none">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">Pipeline Progress</CardTitle>
                    <CardDescription className="text-xs">Real-time status of repository scanning & AI generation</CardDescription>
                </div>
                <Badge variant={isFailed ? "destructive" : isCompleted ? "success" : "secondary"}>
                    {status}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-muted -z-0">
                        <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: isCompleted ? "100%" : `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isPassed = idx < currentStepIndex || isCompleted;
                        
                        return (
                            <div key={idx} className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                    isPassed 
                                        ? "bg-primary text-primary-foreground" 
                                        : isActive 
                                            ? "bg-accent text-accent-foreground ring-2 ring-primary" 
                                            : "bg-muted text-muted-foreground border border-border"
                                }`}>
                                    {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-medium mt-1.5 ${
                                    isActive ? "text-foreground font-semibold" : isPassed ? "text-foreground" : "text-muted-foreground"
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
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
                html += `<pre class="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono border border-border my-3">${escaped}</pre>`;
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

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild, jobs = [] }) {
    if (!selectedRepo) return null;

    const latestJob = jobs.find(j => j.repository?._id === selectedRepo._id);
    const isRunning = latestJob && ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(latestJob.status);

    const displayDuration = latestJob?.duration ? (latestJob.duration / 1000).toFixed(1) + "s" : "N/A";
    const displayLastRun = latestJob?.completedAt 
        ? new Date(latestJob.completedAt).toLocaleString("en-GB", { hour12: false }) 
        : "Never scanned";

    const containerRef = React.useRef(null);
    React.useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = renderMarkdown(latestJob?.generatedReadme || "");
    }, [latestJob?.generatedReadme]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-4">
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
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedRepo.fullName}</p>
                </div>
                <Button
                    size="sm"
                    className="gap-2 font-medium"
                    onClick={() => triggerManualBuild(selectedRepo._id)}
                    disabled={isRunning}
                >
                    {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    <span>{isRunning ? "Running Pipeline..." : "Trigger Manual Scan"}</span>
                </Button>
            </div>

            {/* Live Progress Tracker */}
            {latestJob && latestJob.status !== "COMPLETED" && latestJob.status !== "FAILED" && (
                <ProgressTracker status={latestJob.status} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-none border-border">
                        <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold">README.md Preview</CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs font-normal">GitHub Markdown</Badge>
                        </CardHeader>
                        <CardContent className="p-6 h-[500px] overflow-y-auto">
                            {!latestJob?.generatedReadme ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                    <FileText className="h-10 w-10 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">No README generated yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Click Trigger Manual Scan above to generate docs.</p>
                                </div>
                            ) : (
                                <div ref={containerRef} className="prose dark:prose-invert max-w-none text-xs" />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Properties */}
                <div className="space-y-6">
                    <Card className="shadow-none border-border">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold">Quality Scan Coverage</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5" /> Features Coverage
                                    </span>
                                    <span className="font-semibold text-foreground">{latestJob ? "90%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: latestJob ? "90%" : "0%" }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Route className="h-3.5 w-3.5" /> API Scope
                                    </span>
                                    <span className="font-semibold text-foreground">{latestJob ? "85%" : "0%"}</span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary/70 h-full rounded-full transition-all duration-500" style={{ width: latestJob ? "85%" : "0%" }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold">Repository Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Default Branch</span>
                                <Badge variant="secondary" className="font-mono text-xs">{selectedRepo.branch || "main"}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Last Scanned</span>
                                <span className="font-medium text-foreground">{displayLastRun}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Scan Duration</span>
                                <span className="font-medium text-foreground">{displayDuration}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">Auto-Commit</span>
                                <Badge variant={selectedRepo.isActive ? "success" : "secondary"}>
                                    {selectedRepo.isActive ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
