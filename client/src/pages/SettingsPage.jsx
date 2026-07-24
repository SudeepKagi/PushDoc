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
        <div className="space-y-6 max-w-7xl mx-auto py-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Repository Settings</h1>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure webhooks, analysis branches, and automated generation rules</p>
                </div>
            </header>

            {/* Repo selector if multiple */}
            {repos.length > 0 && (
                <Card className="shadow-none border-border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold">Active Repository</Label>
                            <p className="text-xs text-muted-foreground">Select repository to view or edit target options</p>
                        </div>
                        <Select
                            value={selectedRepo?._id || ""}
                            onValueChange={(val) => {
                                const r = repos.find((repo) => repo._id === val);
                                if (r) openDetails(r);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-72 h-9">
                                <SelectValue placeholder="Select repository..." />
                            </SelectTrigger>
                            <SelectContent>
                                {repos.map((r) => (
                                    <SelectItem key={r._id} value={r._id}>{r.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webhook Card */}
                <Card className="shadow-none border-border">
                    <CardHeader className="p-4 pb-3">
                        <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-semibold">Webhook Integration</CardTitle>
                        </div>
                        <CardDescription className="text-xs">GitHub webhook endpoint and verification secret</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Payload URL</Label>
                            <div className="flex items-center gap-2">
                                <Input readOnly value="http://api.pushdoc.io/webhooks/github" className="font-mono text-xs" />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => copyToClipboard("http://api.pushdoc.io/webhooks/github")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Webhook Secret</Label>
                            <div className="relative">
                                <Input
                                    type={webhookSecretVisible ? "text" : "password"}
                                    defaultValue="secret_token_1234567890"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}
                                >
                                    {webhookSecretVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => alert("Secret regenerated!")}>
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Regenerate Webhook Secret</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Target & Path Card */}
                <Card className="shadow-none border-border">
                    <CardHeader className="p-4 pb-3">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-semibold">Target & Output Path</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Branch to analyze and file output location</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Analysis Branch</Label>
                            <Input
                                value={settingsBranch}
                                onChange={(e) => { setSettingsBranch(e.target.value); setHasUnsavedSettings(true); }}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Documentation Output Path</Label>
                            <Input
                                value={settingsPath}
                                onChange={(e) => { setSettingsPath(e.target.value); setHasUnsavedSettings(true); }}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground border border-border">
                            Changes to <code className="font-mono text-foreground font-semibold">{settingsBranch}</code> will auto-update <code className="font-mono text-foreground font-semibold">{settingsPath}</code>.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Preferences */}
            <Card className="shadow-none border-border">
                <CardHeader className="p-4 pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold">Analysis Preferences</CardTitle>
                    <CardDescription className="text-xs">Toggle which analyzers run during processing</CardDescription>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-start justify-between p-4 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">Route Analyzer</p>
                            <p className="text-[11px] text-muted-foreground">Parses Express/Fastify route endpoints.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.routeAnalyzer}
                            onChange={() => handlePreferenceToggle("routeAnalyzer")}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 mt-0.5"
                        />
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">Model Analyzer</p>
                            <p className="text-[11px] text-muted-foreground">Explains Prisma/Mongoose schemas.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.modelAnalyzer}
                            onChange={() => handlePreferenceToggle("modelAnalyzer")}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 mt-0.5"
                        />
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">Controller Analyzer</p>
                            <p className="text-[11px] text-muted-foreground">Summarizes handler business logic.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={preferences.controllerAnalyzer}
                            onChange={() => handlePreferenceToggle("controllerAnalyzer")}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 mt-0.5"
                        />
                    </label>
                </CardContent>
            </Card>

            {/* Sticky Action Bar */}
            {hasUnsavedSettings && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-card border border-border shadow-lg rounded-lg p-3 flex items-center justify-between gap-4 z-50">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-foreground font-medium">Unsaved changes in preferences</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => { setPreferences({ routeAnalyzer: true, modelAnalyzer: true, controllerAnalyzer: false }); setHasUnsavedSettings(false); }}
                        >
                            Reset
                        </Button>
                        <Button size="sm" className="h-8 text-xs font-medium" onClick={saveConfigurations}>
                            Save Settings
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
