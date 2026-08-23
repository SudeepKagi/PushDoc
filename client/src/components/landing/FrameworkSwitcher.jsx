import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Check, Copy, Terminal } from "lucide-react";

const CODE_SNIPPETS = {
    express: {
        label: "Express.js",
        cmd: "npx pushdoc@latest sync --framework express",
        code: `// PushDoc AST Route & Model Extractor
import { parseExpressRoutes } from "@pushdoc/ast";
import app from "./app.js";

const docs = await parseExpressRoutes(app, {
  extractSchemas: true,
  outputBranch: "main"
});
// ✓ Extracted 14 endpoints & Mongoose schemas`,
    },
    fastify: {
        label: "Fastify",
        cmd: "npx pushdoc@latest sync --framework fastify",
        code: `// PushDoc Fastify Route Parser
import { parseFastifySchemas } from "@pushdoc/ast";
import fastify from "./server.js";

const docs = await parseFastifySchemas(fastify, {
  includeAuthRoutes: true
});
// ✓ Extracted 9 Fastify JSON schema routes`,
    },
    nextjs: {
        label: "Next.js App Router",
        cmd: "npx pushdoc@latest sync --framework next",
        code: `// PushDoc Next.js Route Handler Extractor
import { parseNextRoutes } from "@pushdoc/ast";

const docs = await parseNextRoutes("./src/app/api", {
  generateReadme: true
});
// ✓ Extracted App Router API handlers`,
    },
};

export default function FrameworkSwitcher() {
    const [activeTab, setActiveTab] = useState("express");
    const [copied, setCopied] = useState(false);

    const snippet = CODE_SNIPPETS[activeTab];

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                <div className="text-center space-y-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5 gap-1">
                        <Terminal className="h-3 w-3 text-accent" /> Developer CLI
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Integrate in one command
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
                        Run PushDoc CLI locally or attach to your GitHub Actions pipeline.
                    </p>
                </div>

                <Card className="bg-surface rounded-[6px] overflow-hidden">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            <span className="text-xs font-mono text-text-secondary">pushdoc-config.json</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {Object.keys(CODE_SNIPPETS).map((key) => (
                                <Button
                                    key={key}
                                    variant={activeTab === key ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`text-xs h-6 px-2.5 rounded-[4px] font-sans ${activeTab === key ? "bg-surface text-text-primary font-semibold" : "text-text-secondary"}`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {CODE_SNIPPETS[key].label}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 font-mono text-xs space-y-3">
                        <div className="flex items-center justify-between p-2.5 bg-surface-raised rounded-[6px]">
                            <div className="flex items-center gap-2 text-text-primary">
                                <span className="text-accent font-semibold">$</span>
                                <span>{snippet.cmd}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-text-muted hover:text-text-primary"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>

                        <pre className="text-text-secondary p-3 bg-bg rounded-[6px] overflow-x-auto text-xs leading-relaxed">
                            {snippet.code}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
