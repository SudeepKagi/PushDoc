import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function DetailPage({ selectedRepo, setPage, triggerManualBuild }) {
    if (!selectedRepo) return null;

    return (
        <div className="space-y-8 animate-fade">
            <header className="flex justify-between items-center">
                <div>
                    <button
                        className="flex items-center gap-1.5 text-xs font-bold text-outline hover:text-primary transition-colors mb-2"
                        onClick={() => setPage("dashboard")}
                    >
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Back to Dashboard
                    </button>
                    <h1 className="font-headline text-3xl font-black">{selectedRepo.name} Details</h1>
                    <p className="text-sm text-on-surface-variant mt-1">{selectedRepo.fullName}</p>
                </div>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={() => triggerManualBuild(selectedRepo._id)}
                >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    Queue Verification Job
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Warnings Card */}
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Validation Warnings</h3>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    selectedRepo.warnings.length === 0
                                        ? "bg-secondary-container/20 text-secondary"
                                        : "bg-error-container/20 text-error"
                                }`}
                            >
                                {selectedRepo.warnings.length} Warnings
                            </span>
                        </div>
                        {selectedRepo.warnings.length === 0 ? (
                            <div className="text-secondary text-sm font-semibold flex items-center gap-2 bg-secondary-container/10 p-4 rounded-xl border border-secondary-container/20">
                                <span className="material-symbols-outlined">check_circle</span>
                                No issues found. The README meets all structural and semantic criteria!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedRepo.warnings.map((w, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3.5 bg-error-container/10 border border-error-container/20 rounded-xl text-sm"
                                    >
                                        <span className="material-symbols-outlined text-error text-sm mt-0.5">warning</span>
                                        <span>{w}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Preview Diff Card */}
                    <Card className="p-8">
                        <h3 className="font-bold text-lg mb-6">Generated Documentation Preview</h3>
                        <div className="bg-on-background text-[#f8fafc] rounded-2xl p-6 font-mono text-xs max-h-96 overflow-y-auto space-y-1">
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ # {selectedRepo.name}</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ ## Description</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ Scans and manages webhook integrations securely.</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ ## Tech Stack</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ Express.js, Mongoose, Redis, BullMQ</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ ## API Overview</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ GET /github/sync - Synced active repository lists.</div>
                            <div className="text-[#4ade80] bg-[#4ade80]/15 px-2 py-0.5 rounded font-bold">+ POST /github/callback - Redirect callback verification.</div>
                        </div>
                    </Card>
                </div>

                {/* Right panel properties */}
                <div className="space-y-8">
                    <Card className="p-8">
                        <h3 className="font-bold text-lg mb-6">Project Coverage</h3>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2">
                                    <span>Features Coverage</span>
                                    <span>{selectedRepo.coverage.features}%</span>
                                </div>
                                <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full" style={{ width: `${selectedRepo.coverage.features}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2">
                                    <span>Models Coverage</span>
                                    <span>{selectedRepo.coverage.models}%</span>
                                </div>
                                <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full" style={{ width: `${selectedRepo.coverage.models}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-2">
                                    <span>Routes Coverage</span>
                                    <span>{selectedRepo.coverage.routes}%</span>
                                </div>
                                <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full" style={{ width: `${selectedRepo.coverage.routes}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <h3 className="font-bold text-lg mb-6">Job Properties</h3>
                        <div className="space-y-4 text-sm font-semibold text-on-surface-variant">
                            <div className="flex justify-between">
                                <span>Default Branch:</span>
                                <span className="font-mono">{selectedRepo.branch || "main"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Time Taken:</span>
                                <span>{(selectedRepo.duration / 1000).toFixed(2)}s</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Scanned:</span>
                                <span>{selectedRepo.lastRun}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Visibility:</span>
                                <span>{selectedRepo.private ? "Private" : "Public"}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
