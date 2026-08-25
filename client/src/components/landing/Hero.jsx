import React, { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { GithubIcon as Github } from "../ui/githubIcon.jsx";
import { ArrowRight, Webhook, Code2, GitCommit, Sparkles, CheckCircle2, FileText, Database, Shield, Layers, Network, AlertTriangle } from "lucide-react";

const ARCHITECTURE_WIDGET_TABS = [
    {
        id: "facts",
        label: "Common Fact Model",
        icon: Code2,
        title: "Traceable, Evidence-Backed Facts",
        desc: "Extracts normalized endpoint, datastore, and dependency facts with source reliability and confidence scoring.",
        renderPreview: () => (
            <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-text-secondary border-b border-border pb-2">
                    <span>Extracted Fact Descriptor</span>
                    <span className="text-success font-semibold">fact:endpoint:payment-service:post:/api/v1/charge</span>
                </div>
                <div className="p-3 bg-surface-raised rounded-[6px] space-y-1.5 text-xs">
                    <div className="text-accent font-semibold">// Common Fact Model Entry</div>
                    <div className="text-text-primary">Type: "endpoint" | Method: POST | Path: /api/v1/charge</div>
                    <div className="text-text-secondary">Source: payment-service/src/routes/pay.py:42 (analyzer: python)</div>
                    <div className="text-text-secondary">Evidence: ["FastAPI @router.post()"] | Confidence: 0.98 | Reliability: 1.0</div>
                </div>
                <div className="flex items-center gap-2 text-success text-xs font-sans font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evidence-grounded fact layer ready for correlation & context synthesis</span>
                </div>
            </div>
        ),
    },
    {
        id: "graph",
        label: "Architecture Graph",
        icon: Network,
        title: "Entity-Relationship Topology & External APIs",
        desc: "Synthesizes services, datastores, message brokers, and third-party SaaS APIs into a connected graph.",
        renderPreview: () => (
            <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-text-secondary border-b border-border pb-2">
                    <span>Derived Relationship Graph</span>
                    <span className="text-accent font-semibold">3 Services • 2 Datastores • 1 External API</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-surface-raised rounded-[6px] space-y-1">
                        <div className="text-text-primary font-semibold">api-gateway ──(calls_http)──&gt; payment-service</div>
                        <div className="text-text-muted text-[11px]">Protocol: REST (POST /api/v1/charge)</div>
                    </div>
                    <div className="p-2.5 bg-surface-raised rounded-[6px] space-y-1">
                        <div className="text-text-primary font-semibold">payment-service ──(calls_api)──&gt; Stripe API</div>
                        <div className="text-text-muted text-[11px]">Detected via stripe-python client</div>
                    </div>
                    <div className="p-2.5 bg-surface-raised rounded-[6px] space-y-1">
                        <div className="text-text-primary font-semibold">order-service ──(publishes_to)──&gt; Kafka: orders</div>
                        <div className="text-text-muted text-[11px]">Protocol: Kafka event bus</div>
                    </div>
                    <div className="p-2.5 bg-surface-raised rounded-[6px] space-y-1">
                        <div className="text-text-primary font-semibold">user-service ──(uses_datastore)──&gt; PostgreSQL</div>
                        <div className="text-text-muted text-[11px]">ORM: Spring Data JPA</div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "conflicts",
        label: "Contract Drift Detection",
        icon: AlertTriangle,
        title: "OpenAPI Spec vs Code Route Drift",
        desc: "Detects breaking mismatches between OpenAPI/Swagger specifications and actual source code routes.",
        renderPreview: () => (
            <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-text-secondary border-b border-border pb-2">
                    <span>Derived Conflict Finding</span>
                    <Badge variant="warning" className="text-[10px] font-mono">HIGH SEVERITY</Badge>
                </div>
                <div className="p-3 bg-surface-raised rounded-[6px] space-y-1.5 text-xs">
                    <div className="text-warning font-semibold">⚠️ Contract Mismatch Detected</div>
                    <div className="text-text-primary">Expected: GET /api/v1/payments (declared in openapi.yaml:28)</div>
                    <div className="text-text-secondary">Actual: GET /api/v1/payment (implemented in routes/pay.js:14)</div>
                    <div className="text-text-muted text-[11px]">Finding: OpenAPI spec documents plural route but code exports singular route.</div>
                </div>
                <div className="flex items-center gap-2 text-warning text-xs font-sans font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Flagged directly in context to prevent inaccurate API documentation</span>
                </div>
            </div>
        ),
    },
    {
        id: "readme",
        label: "Automated Git Sync",
        icon: FileText,
        title: "Deterministic Synthesis & Git Commit",
        desc: "Synthesizes structured README documentation grounded in verified facts and commits directly to GitHub.",
        renderPreview: () => (
            <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-semibold text-text-primary"># Architecture &amp; API Reference</span>
                    <Badge variant="secondary" className="font-mono text-xs">README.md</Badge>
                </div>
                <p className="text-text-secondary text-xs leading-relaxed">
                    Automated documentation generated by PushDoc engine grounded in 42 verified architecture facts for commit <code className="bg-surface-raised px-1.5 py-0.5 rounded-[4px] font-mono text-xs text-text-primary">#9b3e1f0</code>.
                </p>
                <div className="p-3 bg-surface-raised rounded-[6px] space-y-1 text-xs font-mono">
                    <div className="text-success font-semibold">✓ Committed to origin/main</div>
                    <div className="text-text-secondary">Validation Score: 98/100 • Sections: [Overview, Architecture, API, Models, Tech Stack]</div>
                </div>
            </div>
        ),
    },
];

export default function Hero({ handleLoginRedirect, setPage }) {
    const [activeTabId, setActiveTabId] = useState("facts");

    const activeTab = ARCHITECTURE_WIDGET_TABS.find(t => t.id === activeTabId) || ARCHITECTURE_WIDGET_TABS[0];

    const scrollToArchitecture = () => {
        const el = document.getElementById("architecture");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative pt-24 pb-16 bg-bg text-text-primary font-sans">
            <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
                {/* Announcement chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-surface-raised text-xs font-mono border border-border">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-text-primary font-medium">PushDoc Architecture Engine</span>
                    <span className="text-text-muted">• Polyglot Codebase Analysis</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary max-w-3xl mx-auto leading-tight">
                    Your Codebase. Analyzed &amp; Documented on Every Commit.
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
                    An evidence-backed repository intelligence platform that extracts traceable code facts, builds an architecture graph, detects contract drift, and generates grounded documentation on every git push.
                </p>

                {/* Genuine Action Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button 
                        size="lg" 
                        onClick={() => setPage("connect")}
                        className="gap-2 font-medium rounded-[6px] px-6 h-10 text-sm"
                    >
                        <Github className="h-4 w-4" />
                        <span>Connect GitHub Repository</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={scrollToArchitecture}
                        className="font-medium rounded-[6px] px-5 h-10 text-sm"
                    >
                        <span>How It Works</span>
                    </Button>
                </div>

                {/* Interactive Live Canvas Widget */}
                <div className="mt-12 text-left">
                    <Card className="bg-surface rounded-[6px] overflow-hidden border border-border">
                        <div className="p-3 border-b border-border bg-surface-raised flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-accent" />
                                <span className="text-xs font-mono font-medium text-text-secondary">Architecture Engine Inspector</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {ARCHITECTURE_WIDGET_TABS.map((tab) => {
                                    const TabIcon = tab.icon;
                                    const isActive = tab.id === activeTabId;
                                    return (
                                        <Button
                                            key={tab.id}
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="sm"
                                            className={`text-xs h-6 px-2.5 rounded-[4px] gap-1.5 ${isActive ? "bg-surface text-text-primary font-semibold" : "text-text-secondary"}`}
                                            onClick={() => setActiveTabId(tab.id)}
                                        >
                                            <TabIcon className="h-3.5 w-3.5" />
                                            <span>{tab.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-semibold text-text-primary font-sans">{activeTab.title}</h3>
                                <p className="text-xs text-text-secondary font-sans leading-relaxed">{activeTab.desc}</p>
                            </div>

                            <div className="p-3 bg-bg rounded-[6px] transition-all border border-border">
                                {activeTab.renderPreview()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3-Bento Feature Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
                    <Card className="bg-surface-raised rounded-[6px] border border-border">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary mb-2">
                                <Webhook className="h-4 w-4 text-accent" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary font-sans">Zero-Config GitHub Webhooks</h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                Automatically fires on git push events with cryptographic HMAC-SHA256 signature verification and BullMQ Redis background queues.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px] border border-border">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary mb-2">
                                <Network className="h-4 w-4 text-accent" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary font-sans">Common Facts &amp; Architecture Graph</h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                Extracts polyglot endpoints and constructs an entity-relationship topology connecting services, datastores, and message brokers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface-raised rounded-[6px] border border-border">
                        <CardContent className="p-4 space-y-2">
                            <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary mb-2">
                                <AlertTriangle className="h-4 w-4 text-accent" />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary font-sans">Contract Drift &amp; Automated Commit</h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                Detects OpenAPI spec vs code route mismatches and commits validated, production-grade documentation directly back to your repo.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
