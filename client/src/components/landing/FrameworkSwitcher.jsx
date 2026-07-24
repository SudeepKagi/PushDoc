import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Check, Copy, Terminal, Code2 } from "lucide-react";

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
        <section className="py-20 bg-background border-t border-border">
            <div className="max-w-4xl mx-auto px-6 space-y-8">
                <div className="text-center space-y-3">
                    <Badge variant="outline" className="text-xs font-normal rounded-full px-3 gap-1">
                        <Terminal className="h-3.5 w-3.5 text-primary" /> Developer CLI
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Integrate in one command
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                        Run PushDoc CLI locally or attach to your GitHub Actions pipeline.
                    </p>
                </div>

                <Card className="shadow-2xl border-border bg-card overflow-hidden">
                    <CardHeader className="p-4 pb-3 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 mr-2">
                                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">pushdoc-config.json</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {Object.keys(CODE_SNIPPETS).map((key) => (
                                <Button
                                    key={key}
                                    variant={activeTab === key ? "secondary" : "ghost"}
                                    size="sm"
                                    className="text-xs h-7 px-3 font-medium"
                                    onClick={() => setActiveTab(key)}
                                >
                                    {CODE_SNIPPETS[key].label}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 font-mono text-xs space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/60 rounded-md border border-border">
                            <div className="flex items-center gap-2 text-foreground">
                                <span className="text-primary">$</span>
                                <span>{snippet.cmd}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>

                        <pre className="text-muted-foreground p-4 bg-muted/30 rounded-md overflow-x-auto border border-border/50 text-[11px] leading-relaxed">
                            {snippet.code}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
