import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { Settings, Webhook, GitBranch, Copy, Eye, EyeOff, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SettingsPage({
    selectedRepo,
    repos,
    openDetails,
    webhookSecretVisible,
    setWebhookSecretVisible,
    settingsBranch,
    setSettingsBranch,
    settingsPath,
    setSettingsPath,
    preferences,
    setPreferences,
    hasUnsavedSettings,
    setHasUnsavedSettings,
    handlePreferenceToggle,
    saveConfigurations,
    copyToClipboard
}) {
    return (
        <div className="space-y-6 max-w-7xl mx-auto py-4 font-sans">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-text-muted" />
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Repository Settings</h1>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">Configure webhooks, analysis branches, and automated generation rules</p>
                </div>
            </header>

            {/* Repo selector if multiple */}
            {repos.length > 0 && (
                <Card className="bg-surface rounded-[6px] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold text-text-primary">Active Repository</Label>
                            <p className="text-xs text-text-secondary">Select repository to view or edit target options</p>
                        </div>
                        <Select
                            value={selectedRepo?._id || ""}
                            onValueChange={(val) => {
                                const r = repos.find((repo) => repo._id === val);
                                if (r) openDetails(r);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-72 h-8 text-xs font-mono rounded-[6px]">
                                <SelectValue placeholder="Select repository..." />
                            </SelectTrigger>
                            <SelectContent className="bg-surface-raised rounded-[6px]">
                                {repos.map((r) => (
                                    <SelectItem key={r._id} value={r._id} className="font-mono text-xs">{r.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webhook Card */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-4 pb-2 border-b border-border bg-surface-raised">
                        <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4 text-accent" />
                            <CardTitle className="text-xs font-semibold text-text-primary">Webhook Integration</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-text-secondary">GitHub webhook endpoint and verification secret</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Payload URL</Label>
                            <div className="flex items-center gap-2">
                                <Input readOnly value="https://pushdoc-api.onrender.com/webhooks/github" className="font-mono text-xs h-8 rounded-[6px]" />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 rounded-[6px]"
                                    onClick={() => copyToClipboard("https://pushdoc-api.onrender.com/webhooks/github")}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Webhook Secret</Label>
                            <div className="relative">
                                <Input
                                    type={webhookSecretVisible ? "text" : "password"}
                                    defaultValue="secret_token_1234567890"
                                    className="font-mono text-xs h-8 rounded-[6px]"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-text-muted hover:text-text-primary"
                                    onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}
                                >
                                    {webhookSecretVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs rounded-[6px]" onClick={() => alert("Secret regenerated!")}>
                            <RefreshCw className="h-3 w-3" />
                            <span>Regenerate Secret</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Target & Path Card */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-4 pb-2 border-b border-border bg-surface-raised">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-accent" />
                            <CardTitle className="text-xs font-semibold text-text-primary">Target & Output Path</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-text-secondary">Branch to analyze and file output location</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Analysis Branch</Label>
                            <Input
                                value={settingsBranch}
                                onChange={(e) => { setSettingsBranch(e.target.value); setHasUnsavedSettings(true); }}
                                className="font-mono text-xs h-8 rounded-[6px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Documentation Output Path</Label>
                            <Input
                                value={settingsPath}
                                onChange={(e) => { setSettingsPath(e.target.value); setHasUnsavedSettings(true); }}
                                className="font-mono text-xs h-8 rounded-[6px]"
                            />
                        </div>

                        <div className="p-2.5 bg-surface-raised rounded-[6px] text-xs text-text-secondary font-sans">
                            Changes to <code className="font-mono text-text-primary font-medium">{settingsBranch}</code> will auto-update <code className="font-mono text-text-primary font-medium">{settingsPath}</code>.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Preferences */}
            <Card className="bg-surface rounded-[6px]">
                <CardHeader className="p-4 pb-2 border-b border-border bg-surface-raised">
                    <CardTitle className="text-xs font-semibold text-text-primary">Analysis Preferences</CardTitle>
                    <CardDescription className="text-xs text-text-secondary">Toggle which analyzers run during processing</CardDescription>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-text-primary">Route Analyzer</p>
                            <p className="text-xs text-text-secondary">Parses Express/Fastify route endpoints.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.routeAnalyzer}
                            onChange={() => handlePreferenceToggle("routeAnalyzer")}
                            className="rounded-[4px] border-border text-accent focus:ring-accent h-4 w-4 mt-0.5"
                        />
                    </label>

                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-text-primary">Model Analyzer</p>
                            <p className="text-xs text-text-secondary">Explains Prisma/Mongoose schemas.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.modelAnalyzer}
                            onChange={() => handlePreferenceToggle("modelAnalyzer")}
                            className="rounded-[4px] border-border text-accent focus:ring-accent h-4 w-4 mt-0.5"
                        />
                    </label>

                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-text-primary">Controller Analyzer</p>
                            <p className="text-xs text-text-secondary">Summarizes handler business logic.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.controllerAnalyzer}
                            onChange={() => handlePreferenceToggle("controllerAnalyzer")}
                            className="rounded-[4px] border-border text-accent focus:ring-accent h-4 w-4 mt-0.5"
                        />
                    </label>
                </CardContent>
            </Card>

            {/* Sticky Action Bar */}
            {hasUnsavedSettings && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-surface-raised shadow-md rounded-[6px] p-3 flex items-center justify-between gap-4 z-50">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs text-text-primary font-medium">Unsaved changes in preferences</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs rounded-[6px]"
                            onClick={() => { setPreferences({ routeAnalyzer: true, modelAnalyzer: true, controllerAnalyzer: false }); setHasUnsavedSettings(false); }}
                        >
                            Reset
                        </Button>
                        <Button size="sm" className="h-7 text-xs font-medium rounded-[6px]" onClick={saveConfigurations}>
                            Save Settings
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
