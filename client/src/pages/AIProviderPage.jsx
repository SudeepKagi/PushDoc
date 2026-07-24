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
        <div className="space-y-6 max-w-7xl mx-auto py-4">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Provider & Failover Keys</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Manage Gemini and Groq API token priorities and failover settings</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Keys Table */}
                <Card className="lg:col-span-2 shadow-none border-border">
                    <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Active Key Status</CardTitle>
                            <CardDescription className="text-xs">Real-time status of AI generation providers</CardDescription>
                        </div>
                        <Badge variant="success" className="text-xs font-normal gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                                    <TableHead className="text-xs font-semibold">Latency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-primary" />
                                        <span>Gemini 2.5 Flash</span>
                                    </TableCell>
                                    <TableCell><Badge variant="default" className="text-xs font-normal">PRIMARY</Badge></TableCell>
                                    <TableCell><Badge variant="success" className="text-xs font-normal">Healthy</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">482ms</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-primary/70" />
                                        <span>Gemini Pro</span>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-normal">STANDBY</Badge></TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-normal">Ready</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">210ms</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-xs font-medium flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <span>Groq Llama 3.3 70B</span>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs font-normal">FAILOVER</Badge></TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs font-normal">Ready</Badge></TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">114ms</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Tokens Card */}
                <Card className="shadow-none border-border flex flex-col justify-between">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold">Token Usage</CardTitle>
                        <CardDescription className="text-xs">Billing cycle usage</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="text-3xl font-bold tracking-tight text-foreground mb-1">7.7M</div>
                        <p className="text-xs text-muted-foreground">Total Tokens Processed (+12% vs last cycle)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Config Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gemini Config */}
                <Card className="shadow-none border-border">
                    <CardHeader className="p-4 pb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-semibold">Add Gemini Token</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Key Label</Label>
                            <Input
                                placeholder="e.g. Production Main"
                                value={geminiKeyLabel}
                                onChange={(e) => setGeminiKeyLabel(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">API Token</Label>
                            <div className="relative">
                                <Input
                                    type={geminiKeyVisible ? "text" : "password"}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter Gemini API key..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setGeminiKeyVisible(!geminiKeyVisible)}
                                >
                                    {geminiKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                        {geminiKeyStatus && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{geminiKeyStatus}</span>
                            </div>
                        )}
                        <Button className="w-full h-9 font-medium" onClick={handleSaveGeminiKey}>
                            Save Gemini Key
                        </Button>
                    </CardContent>
                </Card>

                {/* Groq Config */}
                <Card className="shadow-none border-border">
                    <CardHeader className="p-4 pb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <CardTitle className="text-sm font-semibold">Add Groq Token</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Key Label</Label>
                            <Input
                                placeholder="e.g. Failover Tier 1"
                                value={groqKeyLabel}
                                onChange={(e) => setGroqKeyLabel(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">API Token</Label>
                            <div className="relative">
                                <Input
                                    type={groqKeyVisible ? "text" : "password"}
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="Enter Groq API key..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setGroqKeyVisible(!groqKeyVisible)}
                                >
                                    {groqKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                        {groqKeyStatus && (
                            <div className="text-xs text-muted-foreground font-medium">
                                {groqKeyStatus}
                            </div>
                        )}
                        <Button variant="outline" className="w-full h-9 font-medium" onClick={handleSaveGroqKey}>
                            Save Groq Key
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
