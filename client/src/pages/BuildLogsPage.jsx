import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table.jsx";
import { ArrowLeft, Terminal, CheckCircle2, AlertCircle, Clock, GitCommit, User } from "lucide-react";

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
        <div className="space-y-6 max-w-7xl mx-auto py-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-0 text-xs text-muted-foreground hover:text-foreground h-7 mb-1"
                        onClick={() => setPage("dashboard")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Build History & Execution Logs</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Audit background pipeline jobs and commit sync logs</p>
                </div>
            </header>

            {/* Stats strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-none border-border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 border border-border">
                        <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Total Runs</p>
                        <p className="text-xl font-bold tracking-tight text-foreground">{totalRuns}</p>
                    </div>
                </Card>
                <Card className="shadow-none border-border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Completed</p>
                        <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                    </div>
                </Card>
                <Card className="shadow-none border-border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Failed</p>
                        <p className="text-xl font-bold tracking-tight text-destructive">{failedCount}</p>
                    </div>
                </Card>
            </div>

            {/* Execution List Table */}
            <Card className="shadow-none border-border">
                <CardHeader className="p-4 pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold">Commit Execution List</CardTitle>
                    <CardDescription className="text-xs">History of triggered README generation jobs</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingJobs ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">Loading build history...</div>
                    ) : jobs.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">No build runs recorded yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold">Commit SHA</TableHead>
                                    <TableHead className="text-xs font-semibold">Repository</TableHead>
                                    <TableHead className="text-xs font-semibold">Branch</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.map((job, idx) => {
                                    const isCompleted = job.status === "COMPLETED";
                                    const isFailed = job.status === "FAILED";
                                    const isSelected = activeBuildIndex === idx;

                                    return (
                                        <TableRow
                                            key={job._id}
                                            className={`cursor-pointer ${isSelected ? "bg-muted/50 font-medium" : ""}`}
                                            onClick={() => setActiveBuildIndex(idx)}
                                        >
                                            <TableCell className="font-mono text-xs text-primary font-semibold">
                                                <div className="flex items-center gap-1.5">
                                                    <GitCommit className="h-3.5 w-3.5" />
                                                    <span>#{job.commitSha?.substring(0, 7) || "head"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-foreground">
                                                {job.repository?.name || "Repository"}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {job.branch || "main"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isCompleted ? "success" : isFailed ? "destructive" : "secondary"} className="text-xs font-normal">
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{job.duration ? (job.duration / 1000).toFixed(1) + "s" : "N/A"}</span>
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
