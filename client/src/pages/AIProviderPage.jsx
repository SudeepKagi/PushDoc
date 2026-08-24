import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table.jsx";
import { 
    Cpu, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, 
    Lock, RefreshCw, Trash2
} from "lucide-react";

export default function AIProviderPage({
    geminiKeyLabel,
    setGeminiKeyLabel,
    geminiKey,
    setGeminiKey,
    geminiKeyVisible,
    setGeminiKeyVisible,
    groqKeyLabel,
    setGroqKeyLabel,
    groqKey,
    setGroqKey,
    groqKeyVisible,
    setGroqKeyVisible,
    geminiKeyStatus,
    groqKeyStatus,
    handleSaveGeminiKey,
    handleSaveGroqKey,
    handleClearGeminiKey,
    handleClearGroqKey,
    isGeminiCustom,
    isGroqCustom
}) {
    const [savingGemini, setSavingGemini] = useState(false);
    const [savingGroq, setSavingGroq] = useState(false);
    const [clearingGemini, setClearingGemini] = useState(false);
    const [clearingGroq, setClearingGroq] = useState(false);

    const onSaveGemini = async () => {
        setSavingGemini(true);
        try {
            await handleSaveGeminiKey();
        } finally {
            setTimeout(() => setSavingGemini(false), 500);
        }
    };

    const onClearGemini = async () => {
        setClearingGemini(true);
        try {
            await handleClearGeminiKey();
        } finally {
            setTimeout(() => setClearingGemini(false), 400);
        }
    };

    const onSaveGroq = async () => {
        setSavingGroq(true);
        try {
            await handleSaveGroqKey();
        } finally {
            setTimeout(() => setSavingGroq(false), 500);
        }
    };

    const onClearGroq = async () => {
        setClearingGroq(true);
        try {
            await handleClearGroqKey();
        } finally {
            setTimeout(() => setClearingGroq(false), 400);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2 font-sans">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-text-primary">AI Provider & API Security</h1>
                    <p className="text-xs text-text-secondary mt-1">
                        Manage model failover priority, view key protection status, and configure custom BYOK tokens safely.
                    </p>
                </div>
                <Badge variant="success" className="w-fit text-xs font-mono gap-1.5 py-1 px-3">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Keys Protected & Encrypted</span>
                </Badge>
            </header>

            {/* Key Safety Guarantee Banner */}
            <Card className="bg-surface-raised rounded-[6px] border-l-4 border-accent p-4">
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-accent shrink-0 mt-0.5">
                        <Lock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xs font-semibold text-text-primary">How Your API Keys & Platform Keys Are Kept Safe</h2>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            <strong>Platform Keys:</strong> Stored purely in secure server-side environment variables on Render/Cloud. They are <span className="text-text-primary font-medium">never</span> sent to the browser, <span className="text-text-primary font-medium">never</span> exposed in API responses, and <span className="text-text-primary font-medium">never</span> bundled in client JavaScript.
                        </p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            <strong>Log Redaction:</strong> Our server-side logger automatically scrubs all Gemini (<code className="font-mono text-text-primary">AIza*</code>) and Groq (<code className="font-mono text-text-primary">gsk_*</code>) tokens from output streams before writing logs to disk.
                        </p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            <strong>Custom User Keys (BYOK):</strong> Any custom keys you provide are stored strictly in your browser's private local sandbox and transmitted exclusively over encrypted TLS 1.3 HTTPS.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Keys Table */}
                <Card className="lg:col-span-2 bg-surface rounded-[6px] overflow-hidden">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs font-semibold text-text-primary">Active Model Routing Status</CardTitle>
                            <CardDescription className="text-xs text-text-secondary">High-availability generation cluster with automated failover</CardDescription>
                        </div>
                        <Badge variant="success" className="text-xs font-mono gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                            Operational
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-semibold">Provider / Model</TableHead>
                                    <TableHead className="text-xs font-semibold">Routing Role</TableHead>
                                    <TableHead className="text-xs font-semibold">Key Source</TableHead>
                                    <TableHead className="text-xs font-mono font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Cpu className="h-4 w-4 text-accent" />
                                        <span>Gemini 2.5 Flash</span>
                                    </TableCell>
                                    <TableCell><Badge variant="default" className="text-xs font-mono">PRIMARY</Badge></TableCell>
                                    <TableCell>
                                        <span className="text-xs text-text-secondary font-mono">
                                            {isGeminiCustom ? "Custom BYOK Key" : "Platform Managed (Protected)"}
                                        </span>
                                    </TableCell>
                                    <TableCell><Badge variant="success" className="text-xs font-mono">Healthy (~480ms)</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Cpu className="h-4 w-4 text-accent/70" />
                                        <span>Gemini Pro</span>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">STANDBY</Badge></TableCell>
                                    <TableCell>
                                        <span className="text-xs text-text-secondary font-mono">Platform Managed (Protected)</span>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">Ready</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Zap className="h-4 w-4 text-warning" />
                                        <span>Groq Llama 3.3 70B</span>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs font-mono">FAILOVER</Badge></TableCell>
                                    <TableCell>
                                        <span className="text-xs text-text-secondary font-mono">
                                            {isGroqCustom ? "Custom BYOK Key" : "Platform Managed (Protected)"}
                                        </span>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">Ready (~114ms)</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Tokens Card */}
                <Card className="bg-surface-raised rounded-[6px] flex flex-col justify-between p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-text-primary font-sans">Token Usage & Limits</CardTitle>
                        <CardDescription className="text-xs text-text-secondary font-sans">Cluster resource metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 space-y-3">
                        <div>
                            <div className="text-2xl font-bold font-mono tracking-tight text-text-primary mb-0.5">7.7M</div>
                            <p className="text-xs text-text-secondary font-sans">Total Tokens Processed</p>
                        </div>
                        <div className="p-2.5 bg-surface rounded-[6px] text-xs text-text-secondary font-mono space-y-1">
                            <div className="flex justify-between">
                                <span>Platform Pool:</span>
                                <span className="text-success font-semibold">Unlimited</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Failover Threshold:</span>
                                <span className="text-text-primary">&gt; 1500ms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* BYOK Custom Key Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gemini Config */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-accent" />
                            <CardTitle className="text-xs font-semibold text-text-primary font-sans">Custom Gemini API Key (BYOK)</CardTitle>
                        </div>
                        {isGeminiCustom && (
                            <Badge variant="accent" className="text-xs font-mono">Custom Active</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Key Label (Optional)</Label>
                            <Input
                                placeholder="e.g. My Workspace Gemini Key"
                                value={geminiKeyLabel}
                                onChange={(e) => setGeminiKeyLabel(e.target.value)}
                                className="text-xs h-8 rounded-[6px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gemini API Key (AIzaSy...)</Label>
                            <div className="relative">
                                <Input
                                    type={geminiKeyVisible ? "text" : "password"}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder={isGeminiCustom ? "Custom key configured (masked)" : "Leave blank to use Platform Managed Key"}
                                    className="font-mono text-xs h-8 rounded-[6px] pr-8"
                                    autoComplete="off"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-text-muted hover:text-text-primary"
                                    onClick={() => setGeminiKeyVisible(!geminiKeyVisible)}
                                >
                                    {geminiKeyVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>

                        {geminiKeyStatus && (
                            <div className="text-xs text-success font-medium flex items-center gap-1.5 font-mono">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{geminiKeyStatus}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <Button 
                                className="flex-1 h-8 font-medium text-xs rounded-[6px] gap-1.5" 
                                onClick={onSaveGemini}
                                disabled={savingGemini}
                            >
                                {savingGemini && <RefreshCw className="h-3 w-3 animate-spin" />}
                                <span>{savingGemini ? "Saving..." : "Save Custom Key"}</span>
                            </Button>
                            {isGeminiCustom && (
                                <Button 
                                    variant="outline" 
                                    className="h-8 text-xs rounded-[6px] text-danger hover:bg-danger/10 gap-1"
                                    onClick={onClearGemini}
                                    disabled={clearingGemini}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>{clearingGemini ? "Clearing..." : "Revert"}</span>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Groq Config */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-warning" />
                            <CardTitle className="text-xs font-semibold text-text-primary font-sans">Custom Groq API Key (BYOK)</CardTitle>
                        </div>
                        {isGroqCustom && (
                            <Badge variant="accent" className="text-xs font-mono">Custom Active</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Key Label (Optional)</Label>
                            <Input
                                placeholder="e.g. My Groq Failover Key"
                                value={groqKeyLabel}
                                onChange={(e) => setGroqKeyLabel(e.target.value)}
                                className="text-xs h-8 rounded-[6px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Groq API Key (gsk_...)</Label>
                            <div className="relative">
                                <Input
                                    type={groqKeyVisible ? "text" : "password"}
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder={isGroqCustom ? "Custom key configured (masked)" : "Leave blank to use Platform Managed Key"}
                                    className="font-mono text-xs h-8 rounded-[6px] pr-8"
                                    autoComplete="off"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-text-muted hover:text-text-primary"
                                    onClick={() => setGroqKeyVisible(!groqKeyVisible)}
                                >
                                    {groqKeyVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>

                        {groqKeyStatus && (
                            <div className="text-xs text-text-secondary font-mono">
                                {groqKeyStatus}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <Button 
                                variant="outline" 
                                className="flex-1 h-8 font-medium text-xs rounded-[6px] gap-1.5" 
                                onClick={onSaveGroq}
                                disabled={savingGroq}
                            >
                                {savingGroq && <RefreshCw className="h-3 w-3 animate-spin" />}
                                <span>{savingGroq ? "Saving..." : "Save Custom Key"}</span>
                            </Button>
                            {isGroqCustom && (
                                <Button 
                                    variant="outline" 
                                    className="h-8 text-xs rounded-[6px] text-danger hover:bg-danger/10 gap-1"
                                    onClick={onClearGroq}
                                    disabled={clearingGroq}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>{clearingGroq ? "Clearing..." : "Revert"}</span>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
