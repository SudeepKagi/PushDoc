import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { Accordion, AccordionItem } from "../ui/accordion.jsx";
import { CheckCircle2, HelpCircle, Code2, GitCommit, FileText, Network, AlertTriangle } from "lucide-react";

const ACCURATE_FAQS = [
    {
        q: "How does PushDoc ensure generated documentation is grounded in real code?",
        a: "PushDoc runs deterministic static analysis plugins (Node.js, Python, Java, Go) to extract a Common Fact Model containing endpoints, schemas, datastores, and dependencies before any AI prompt compilation. The AI synthesizes documentation grounded strictly in these verified static facts.",
    },
    {
        q: "How does PushDoc discover cross-service relationships in microservices and monorepos?",
        a: "PushDoc correlates internal HTTP client calls against known service route registries, matches Kafka/RabbitMQ pub/sub event topics, resolves environment variable endpoints, and maps third-party SaaS integrations (Stripe, Twilio, AWS, SendGrid).",
    },
    {
        q: "How does contract drift detection work?",
        a: "When an OpenAPI or Swagger specification is present in the repository, PushDoc normalizes paths and methods across both the specification and the implemented source code routes, identifying any discrepancies or missing endpoints.",
    },
    {
        q: "How are GitHub Webhooks secured?",
        a: "Every incoming GitHub push webhook is authenticated using cryptographic HMAC-SHA256 signatures before being queued for asynchronous processing with BullMQ and Redis.",
    },
    {
        q: "Does PushDoc retain private repository source code?",
        a: "No. PushDoc operates under a zero-retention policy. Source trees are cloned into temporary memory buffers during active scan jobs and purged immediately after generating the documentation and committing it back to your repository.",
    },
    {
        q: "Can I bring my own API keys (BYOK)?",
        a: "Yes. PushDoc supports BYOK (Bring Your Own Key) for both Google Gemini and Groq, routing synthesis requests directly through your custom API tokens.",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-16">

                {/* Pipeline Mechanics */}
                <div id="architecture" className="space-y-6">
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5">
                            Pipeline Architecture
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                            How PushDoc processes your repository
                        </h2>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            A four-stage deterministic pipeline from git push to verified documentation commit.
                        </p>
                    </div>

                    <Card className="bg-surface rounded-[6px] overflow-hidden">
                        <Tabs defaultValue="webhook" className="w-full">
                            <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-accent" />
                                    <span className="text-xs font-mono text-text-secondary">PushDoc Pipeline Stages</span>
                                </div>
                                <TabsList className="bg-bg h-7 p-0.5">
                                    <TabsTrigger value="webhook" className="text-xs px-2 h-6 gap-1 font-sans">
                                        <GitCommit className="h-3 w-3" /> 1. Webhook
                                    </TabsTrigger>
                                    <TabsTrigger value="facts" className="text-xs px-2 h-6 gap-1 font-sans">
                                        <Code2 className="h-3 w-3" /> 2. Fact Extraction
                                    </TabsTrigger>
                                    <TabsTrigger value="graph" className="text-xs px-2 h-6 gap-1 font-sans">
                                        <Network className="h-3 w-3" /> 3. Architecture Graph
                                    </TabsTrigger>
                                    <TabsTrigger value="commit" className="text-xs px-2 h-6 gap-1 font-sans">
                                        <FileText className="h-3 w-3" /> 4. README Commit
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-4 font-mono text-xs">
                                <TabsContent value="webhook" className="mt-0 space-y-1.5">
                                    <div className="text-text-secondary">$ git commit -m "feat: add payment processing" &amp;&amp; git push origin main</div>
                                    <div className="text-text-secondary">→ GitHub webhook payload received with HMAC-SHA256 signature</div>
                                    <div className="text-success font-semibold pt-1">
                                        ✓ Signature verified • Job queued in BullMQ Redis queue
                                    </div>
                                </TabsContent>

                                <TabsContent value="facts" className="mt-0 space-y-1.5">
                                    <div className="text-accent font-semibold">// Common Fact Model Layer</div>
                                    <div className="text-text-secondary">• Node.js / Express: 4 routes extracted (confidence: 0.98)</div>
                                    <div className="text-text-secondary">• Python / FastAPI: 2 routes extracted (confidence: 0.95)</div>
                                    <div className="text-text-secondary">• Datastores: PostgreSQL, MongoDB, Redis</div>
                                    <div className="text-success font-semibold pt-1">
                                        ✓ Extracted normalized facts with source traceability
                                    </div>
                                </TabsContent>

                                <TabsContent value="graph" className="mt-0 space-y-1.5">
                                    <div className="text-accent font-semibold">// Architecture Graph &amp; Conflict Resolution</div>
                                    <div className="text-text-secondary">• Resolved: api-gateway ──(calls_http)──&gt; payment-service</div>
                                    <div className="text-text-secondary">• Resolved: payment-service ──(calls_api)──&gt; Stripe API</div>
                                    <div className="text-text-secondary">• Conflict Check: OpenAPI 3.0 spec matches implemented code routes</div>
                                    <div className="text-success font-semibold pt-1">
                                        ✓ Graph topology and Mermaid diagrams synthesized
                                    </div>
                                </TabsContent>

                                <TabsContent value="commit" className="mt-0 space-y-2 font-sans text-xs">
                                    <div className="font-semibold text-sm border-b border-border pb-1.5 text-text-primary">Automated README Generation</div>
                                    <p className="text-text-secondary text-xs leading-relaxed">
                                        README synthesized from verified architecture context and validated with 100-point structure scoring.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-success text-xs font-medium pt-1 font-mono">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Directly committed back to repository default branch</span>
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>

                {/* FAQ */}
                <div id="faq" className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <Badge variant="outline" className="text-xs font-mono gap-1 rounded-[4px] px-2.5">
                            <HelpCircle className="h-3 w-3 text-accent" /> FAQ
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <Accordion className="rounded-[6px] bg-surface-raised divide-y divide-border">
                        {ACCURATE_FAQS.map((faq, idx) => (
                            <AccordionItem key={idx} value={`faq-${idx}`} title={faq.q}>
                                {faq.a}
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
