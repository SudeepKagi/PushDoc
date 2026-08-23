import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table.jsx";
import { Cpu, Key, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

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
    handleSaveGroqKey
}) {
    return (
        <div className="space-y-6 max-w-7xl mx-auto py-4 font-sans">
            <header>
                <h1 className="text-xl font-semibold tracking-tight text-text-primary">AI Provider & Failover Keys</h1>
                <p className="text-xs text-text-secondary mt-0.5">Manage Gemini and Groq API token priorities and failover settings</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Keys Table */}
                <Card className="lg:col-span-2 bg-surface rounded-[6px] overflow-hidden">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs font-semibold text-text-primary">Active Key Status</CardTitle>
                            <CardDescription className="text-xs text-text-secondary">Real-time status of AI generation providers</CardDescription>
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
                                    <TableHead className="text-xs font-semibold">Provider</TableHead>
                                    <TableHead className="text-xs font-semibold">Role</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-mono font-semibold">Latency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Cpu className="h-4 w-4 text-accent" />
                                        <span>Gemini 2.5 Flash</span>
                                    </TableCell>
                                    <TableCell><Badge variant="default" className="text-xs font-mono">PRIMARY</Badge></TableCell>
                                    <TableCell><Badge variant="success" className="text-xs font-mono">Healthy</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-text-secondary">482ms</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Cpu className="h-4 w-4 text-accent/70" />
                                        <span>Gemini Pro</span>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">STANDBY</Badge></TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">Ready</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-text-secondary">210ms</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2 text-text-primary">
                                        <Zap className="h-4 w-4 text-warning" />
                                        <span>Groq Llama 3.3 70B</span>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs font-mono">FAILOVER</Badge></TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-mono">Ready</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-text-secondary">114ms</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Tokens Card */}
                <Card className="bg-surface-raised rounded-[6px] flex flex-col justify-between p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-text-primary font-sans">Token Usage</CardTitle>
                        <CardDescription className="text-xs text-text-secondary font-sans">Billing cycle usage</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-2">
                        <div className="text-2xl font-bold font-mono tracking-tight text-text-primary mb-1">7.7M</div>
                        <p className="text-xs text-text-secondary font-sans">Total Tokens Processed (+12% vs last cycle)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Config Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gemini Config */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-accent" />
                            <CardTitle className="text-xs font-semibold text-text-primary font-sans">Add Gemini Token</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Key Label</Label>
                            <Input
                                placeholder="e.g. Production Main"
                                value={geminiKeyLabel}
                                onChange={(e) => setGeminiKeyLabel(e.target.value)}
                                className="text-xs h-8 rounded-[6px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">API Token</Label>
                            <div className="relative">
                                <Input
                                    type={geminiKeyVisible ? "text" : "password"}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter Gemini API key..."
                                    className="font-mono text-xs h-8 rounded-[6px]"
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
                            <div className="text-xs text-success font-medium flex items-center gap-1 font-mono">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{geminiKeyStatus}</span>
                            </div>
                        )}
                        <Button className="w-full h-8 font-medium text-xs rounded-[6px]" onClick={handleSaveGeminiKey}>
                            Save Gemini Key
                        </Button>
                    </CardContent>
                </Card>

                {/* Groq Config */}
                <Card className="bg-surface rounded-[6px]">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-warning" />
                            <CardTitle className="text-xs font-semibold text-text-primary font-sans">Add Groq Token</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Key Label</Label>
                            <Input
                                placeholder="e.g. Failover Tier 1"
                                value={groqKeyLabel}
                                onChange={(e) => setGroqKeyLabel(e.target.value)}
                                className="text-xs h-8 rounded-[6px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">API Token</Label>
                            <div className="relative">
                                <Input
                                    type={groqKeyVisible ? "text" : "password"}
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="Enter Groq API key..."
                                    className="font-mono text-xs h-8 rounded-[6px]"
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
                        <Button variant="outline" className="w-full h-8 font-medium text-xs rounded-[6px]" onClick={handleSaveGroqKey}>
                            Save Groq Key
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
