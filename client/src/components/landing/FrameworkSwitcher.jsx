import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Check, Code2, Sparkles, Layers } from "lucide-react";

const FRAMEWORK_FACTS = {
    express: {
        label: "Express.js & Mongoose",
        badge: "REST API + Schemas",
        description: "Parses Express route handlers, nested routers, middleware stacks, and Mongoose schema definitions.",
        code: `// Deterministic AST Extraction Output for Express.js
{
  "framework": "Express.js",
  "entryFile": "server.js",
  "routes": [
    {
      "method": "POST",
      "path": "/api/v1/auth/login",
      "controller": "authController.login",
      "middleware": ["validateBody(loginSchema)", "rateLimiter"]
    },
    {
      "method": "GET",
      "path": "/api/v1/users/:id",
      "controller": "userController.getUserById",
      "middleware": ["requireAuth", "verifyOwnership"]
    }
  ],
  "models": [
    {
      "name": "User",
      "collection": "users",
      "fields": ["email (String, Unique)", "role (Enum)", "passwordHash (String)"]
    }
  ]
}`,
    },
    fastify: {
        label: "Fastify",
        badge: "JSON Schema Validation",
        description: "Extracts Fastify route schemas, response validation objects, and lifecycle hooks automatically.",
        code: `// Deterministic AST Extraction Output for Fastify
{
  "framework": "Fastify",
  "entryFile": "app.js",
  "routes": [
    {
      "method": "POST",
      "url": "/api/v1/payments/charge",
      "handler": "paymentHandler.createCharge",
      "schema": {
        "body": { "amount": "number", "currency": "string" },
        "response": { "200": { "status": "string", "transactionId": "string" } }
      }
    }
  ],
  "plugins": ["@fastify/cors", "@fastify/jwt", "@fastify/rate-limit"]
}`,
    },
    nextjs: {
        label: "Next.js & Prisma",
        badge: "App Router + ORM",
        description: "Scans Next.js App Router route handlers (/app/api/.../route.ts) and Prisma schema models.",
        code: `// Deterministic AST Extraction Output for Next.js & Prisma
{
  "framework": "Next.js App Router",
  "routerType": "app-router",
  "endpoints": [
    {
      "file": "app/api/projects/route.ts",
      "methods": ["GET", "POST"],
      "auth": "next-auth / server-session"
    },
    {
      "file": "app/api/projects/[id]/route.ts",
      "methods": ["GET", "PUT", "DELETE"]
    }
  ],
  "prismaModels": [
    { "model": "Project", "fields": ["id", "title", "ownerId", "createdAt"] },
    { "model": "Member", "fields": ["id", "projectId", "userId", "role"] }
  ]
}`,
    },
};

export default function FrameworkSwitcher() {
    const [activeTab, setActiveTab] = useState("express");

    const activeFramework = FRAMEWORK_FACTS[activeTab];

    return (
        <section className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                <div className="text-center space-y-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5 gap-1">
                        <Layers className="h-3 w-3 text-accent" /> Multi-Framework Support
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Automated AST Codebase Extraction
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
                        PushDoc detects your repository stack automatically on push — zero configuration or packages required.
                    </p>
                </div>

                <Card className="bg-surface rounded-[6px] overflow-hidden border border-border">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-xs font-mono text-text-secondary">Extracted AST Fact Graph</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {Object.keys(FRAMEWORK_FACTS).map((key) => (
                                <Button
                                    key={key}
                                    variant={activeTab === key ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`text-xs h-6 px-2.5 rounded-[4px] font-sans ${activeTab === key ? "bg-surface text-text-primary font-semibold border border-border" : "text-text-secondary"}`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {FRAMEWORK_FACTS[key].label}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 font-mono text-xs space-y-3">
                        <div className="flex items-center justify-between p-2.5 bg-surface-raised rounded-[6px] border border-border">
                            <div className="flex items-center gap-2 text-xs font-sans">
                                <span className="font-semibold text-text-primary">{activeFramework.label}</span>
                                <Badge variant="accent" className="text-[10px] font-mono">{activeFramework.badge}</Badge>
                            </div>
                            <span className="text-text-muted text-xs font-mono">100% Ground Truth</span>
                        </div>

                        <p className="text-xs text-text-secondary font-sans leading-relaxed">
                            {activeFramework.description}
                        </p>

                        <pre className="text-text-primary p-3 bg-bg rounded-[6px] overflow-x-auto text-xs leading-relaxed border border-border">
                            {activeFramework.code}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
