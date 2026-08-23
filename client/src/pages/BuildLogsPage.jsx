import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table.jsx";
import { ArrowLeft, Terminal, CheckCircle2, AlertCircle, Clock, GitCommit, RefreshCw } from "lucide-react";

export default function BuildLogsPage({
    jobs = [],
    loadingJobs = false,
    activeBuildIndex,
    setActiveBuildIndex,
    setPage
}) {
    const totalRuns = jobs.length;
    const completedCount = jobs.filter(j => j.status === 'COMPLETED').length;
    const failedCount = jobs.filter(j => j.status === 'FAILED').length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-4 font-sans">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-0 text-xs text-text-secondary hover:text-text-primary h-6 mb-1"
                        onClick={() => setPage("dashboard")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight text-text-primary">Build History & Execution Logs</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Audit background pipeline jobs and commit sync logs</p>
                </div>
            </header>

            {/* Stats strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-surface-raised rounded-[6px] p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-secondary shrink-0">
                        <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium font-sans">Total Runs</p>
                        <p className="text-lg font-bold font-mono tracking-tight text-text-primary">{totalRuns}</p>
                    </div>
                </Card>
                <Card className="bg-surface-raised rounded-[6px] p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-success shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium font-sans">Completed</p>
                        <p className="text-lg font-bold font-mono tracking-tight text-success">{completedCount}</p>
                    </div>
                </Card>
                <Card className="bg-surface-raised rounded-[6px] p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-danger shrink-0">
                        <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium font-sans">Failed</p>
                        <p className="text-lg font-bold font-mono tracking-tight text-danger">{failedCount}</p>
                    </div>
                </Card>
            </div>

            {/* Execution List Table */}
            <Card className="bg-surface rounded-[6px] overflow-hidden">
                <CardHeader className="p-3 border-b border-border bg-surface-raised">
                    <CardTitle className="text-xs font-semibold text-text-primary">Commit Execution List</CardTitle>
                    <CardDescription className="text-xs text-text-secondary">History of triggered README generation jobs</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingJobs && jobs.length === 0 ? (
                        <div className="p-4 space-y-3 animate-pulse">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                                    <Skeleton className="h-4 w-24 bg-surface-raised" />
                                    <Skeleton className="h-4 w-40 bg-surface-raised" />
                                    <Skeleton className="h-4 w-16 bg-surface-raised" />
                                    <Skeleton className="h-5 w-20 rounded-[4px] bg-surface-raised" />
                                    <Skeleton className="h-4 w-12 bg-surface-raised" />
                                </div>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="p-8 text-center text-xs font-mono text-text-secondary">No build runs recorded yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-mono font-semibold">Commit SHA</TableHead>
                                    <TableHead className="text-xs font-sans font-semibold">Repository</TableHead>
                                    <TableHead className="text-xs font-mono font-semibold">Branch</TableHead>
                                    <TableHead className="text-xs font-sans font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-mono font-semibold">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.map((job, idx) => {
                                    const isCompleted = job.status === "COMPLETED";
                                    const isFailed = job.status === "FAILED";
                                    const isSelected = activeBuildIndex === idx;
                                    const isInProgress = ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(job.status);

                                    return (
                                        <TableRow
                                            key={job._id}
                                            className={`cursor-pointer transition-colors ${isSelected ? "bg-surface-raised font-medium" : ""}`}
                                            onClick={() => setActiveBuildIndex(idx)}
                                        >
                                            <TableCell className="font-mono text-xs text-accent font-semibold">
                                                <div className="flex items-center gap-1.5">
                                                    <GitCommit className="h-3.5 w-3.5" />
                                                    <span>#{job.commitSha?.substring(0, 7) || "head"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-text-primary font-mono">
                                                {job.repository?.name || "Repository"}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-text-secondary">
                                                {job.branch || "main"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={isCompleted ? "success" : isFailed ? "destructive" : "secondary"} 
                                                    className="text-xs font-mono gap-1.5"
                                                >
                                                    {isInProgress && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                                    )}
                                                    <span>{job.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary font-mono">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{job.duration ? (job.duration / 1000).toFixed(1) + "s" : isInProgress ? "Running..." : "N/A"}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
