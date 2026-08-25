import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select.jsx";
import { Settings, Webhook, GitBranch, Copy, Check, Eye, EyeOff, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { BACKEND_URL } from "../constants/config.js";

function generateCryptoSecret() {
    try {
        const bytes = new Uint8Array(24);
        window.crypto.getRandomValues(bytes);
        return "whsec_" + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        return "whsec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

export default function SettingsPage({
    selectedRepo,
    repos,
    openDetails,
    webhookSecret,
    setWebhookSecret,
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
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [secretRegeneratedMsg, setSecretRegeneratedMsg] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveConfigurations();
        } finally {
            setTimeout(() => setSaving(false), 600);
        }
    };

    const handleRegenerateSecret = () => {
        setRegenerating(true);
        setSecretRegeneratedMsg(false);

        setTimeout(() => {
            const newSecret = generateCryptoSecret();
            if (setWebhookSecret) {
                setWebhookSecret(newSecret);
                localStorage.setItem("pushdoc_webhook_secret", newSecret);
            }
            navigator.clipboard.writeText(newSecret);
            setCopiedSecret(true);
            setSecretRegeneratedMsg(true);
            setRegenerating(false);

            setTimeout(() => {
                setCopiedSecret(false);
            }, 3000);
        }, 500);
    };

    const handleCopy = (text, type) => {
        copyToClipboard(text);
        if (type === "url") {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } else if (type === "secret") {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        }
    };

    const currentSecret = webhookSecret || "whsec_default_secret_token";

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2 font-sans">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-text-primary">Repository Settings</h1>
                    <p className="text-xs text-text-secondary mt-1">Configure webhooks, analysis branches, and automated generation rules</p>
                </div>
            </header>

            {/* Repo selector if multiple */}
            {repos.length > 0 && (
                <Card className="bg-surface rounded-[6px] p-4 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold text-text-primary">Active Repository Context</Label>
                            <p className="text-xs text-text-secondary">Select repository to view or edit target branch and output preferences</p>
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
                <Card className="bg-surface rounded-[6px] border border-border">
                    <CardHeader className="p-4 pb-2 border-b border-border bg-surface-raised flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4 text-accent" />
                            <CardTitle className="text-xs font-semibold text-text-primary">Webhook Integration</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono gap-1">
                            <ShieldCheck className="h-3 w-3 text-accent" />
                            HMAC SHA-256
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                        {/* Payload URL */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Payload URL</Label>
                                <span className="text-[11px] text-text-muted font-mono">POST</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                    readOnly 
                                    value={`${BACKEND_URL}/webhooks/github`} 
                                    className="font-mono text-xs h-8 rounded-[6px] bg-bg" 
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 rounded-[6px]"
                                    onClick={() => handleCopy(`${BACKEND_URL}/webhooks/github`, "url")}
                                    title="Copy Webhook URL"
                                >
                                    {copiedUrl ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>

                        {/* Webhook Secret */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Webhook Secret Token</Label>
                                <span className="text-[11px] text-text-muted font-mono">256-bit entropy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={webhookSecretVisible ? "text" : "password"}
                                        value={currentSecret}
                                        readOnly
                                        className="font-mono text-xs h-8 rounded-[6px] pr-8 bg-bg"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-text-muted hover:text-text-primary"
                                        onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}
                                        title={webhookSecretVisible ? "Mask secret" : "Reveal secret"}
                                    >
                                        {webhookSecretVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 rounded-[6px]"
                                    onClick={() => handleCopy(currentSecret, "secret")}
                                    title="Copy Webhook Secret"
                                >
                                    {copiedSecret ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>

                        {/* Success Notification on Regeneration */}
                        {secretRegeneratedMsg && (
                            <div className="p-2.5 bg-success/15 border border-success/30 rounded-[4px] text-xs text-success flex items-center gap-2 font-mono animate-in fade-in">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>New HMAC secret generated and copied to clipboard!</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-1 flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1.5 h-8 text-xs rounded-[6px] flex-1 font-medium" 
                                onClick={handleRegenerateSecret}
                                disabled={regenerating}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin text-accent" : ""}`} />
                                <span>{regenerating ? "Generating Crypto Secret..." : "Regenerate Secret"}</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Target & Path Card */}
                <Card className="bg-surface rounded-[6px] border border-border">
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

                        <div className="p-2.5 bg-surface-raised rounded-[6px] text-xs text-text-secondary font-sans border border-border">
                            Changes to <code className="font-mono text-text-primary font-medium">{settingsBranch}</code> will auto-update <code className="font-mono text-text-primary font-medium">{settingsPath}</code>.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Preferences */}
            <Card className="bg-surface rounded-[6px] border border-border">
                <CardHeader className="p-4 pb-2 border-b border-border bg-surface-raised">
                    <CardTitle className="text-xs font-semibold text-text-primary">Analysis Preferences</CardTitle>
                    <CardDescription className="text-xs text-text-secondary">Toggle which AST analyzers run during pipeline execution</CardDescription>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer border border-border">
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

                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer border border-border">
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

                    <label className="flex items-start justify-between p-3 rounded-[6px] bg-surface-raised hover:bg-surface-raised/80 transition-colors cursor-pointer border border-border">
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-surface-raised shadow-md rounded-[6px] p-3 flex items-center justify-between gap-4 z-50 border border-border">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs text-text-primary font-medium">Unsaved changes in preferences</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            className="h-7 text-xs rounded-[6px]"
                            onClick={() => { setPreferences({ routeAnalyzer: true, modelAnalyzer: true, controllerAnalyzer: false }); setHasUnsavedSettings(false); }}
                        >
                            Reset
                        </Button>
                        <Button 
                            size="sm" 
                            disabled={saving}
                            className="h-7 text-xs font-medium rounded-[6px] gap-1.5" 
                            onClick={handleSave}
                        >
                            {saving && <RefreshCw className="h-3 w-3 animate-spin" />}
                            <span>{saving ? "Saving..." : "Save Settings"}</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
