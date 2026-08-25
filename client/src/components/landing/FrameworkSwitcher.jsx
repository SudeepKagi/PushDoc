import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Layers } from "lucide-react";

const FRAMEWORK_FACTS = {
    express: {
        label: "Node.js (Express)",
        badge: "AST + Mongoose",
        description: "Parses Express route handlers, nested routers, middleware stacks, and Mongoose schema definitions via AST scanner.",
        code: `// Extracted Common Facts for Node.js / Express
{
  "ecosystem": "nodejs",
  "service": "auth-api",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/v1/auth/login",
      "handler": "authController.login",
      "middlewares": ["validateBody(loginSchema)", "rateLimiter"],
      "source": { "file": "src/routes/auth.js", "line": 18 },
      "confidence": 0.98
    },
    {
      "method": "GET",
      "path": "/api/v1/users/:id",
      "handler": "userController.getUserById",
      "middlewares": ["requireAuth"],
      "source": { "file": "src/routes/users.js", "line": 24 },
      "confidence": 0.98
    }
  ],
  "datastores": ["MongoDB (Mongoose)"]
}`,
    },
    fastapi: {
        label: "Python (FastAPI)",
        badge: "Route Decorators + SQLAlchemy",
        description: "Extracts FastAPI @router decorators, async handlers, response models, and SQLAlchemy datastore bindings.",
        code: `// Extracted Common Facts for Python / FastAPI
{
  "ecosystem": "python",
  "service": "payment-service",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/v1/payments/charge",
      "handler": "create_charge",
      "source": { "file": "app/routers/payments.py", "line": 34 },
      "confidence": 0.95,
      "evidence": ["FastAPI @router.post()"]
    }
  ],
  "datastores": ["PostgreSQL (SQLAlchemy)"],
  "externalApis": ["Stripe API"]
}`,
    },
    springboot: {
        label: "Java (Spring Boot)",
        badge: "Annotations + JPA",
        description: "Scans Spring Boot @RestController, @GetMapping, @PostMapping annotations and Spring Data JPA entities.",
        code: `// Extracted Common Facts for Java / Spring Boot
{
  "ecosystem": "java",
  "service": "order-service",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/orders/{id}",
      "handler": "getOrder",
      "source": { "file": "src/main/java/OrderController.java", "line": 42 },
      "confidence": 0.95,
      "evidence": ["Spring @GetMapping"]
    },
    {
      "method": "POST",
      "path": "/api/v1/orders",
      "handler": "createOrder",
      "source": { "file": "src/main/java/OrderController.java", "line": 58 },
      "confidence": 0.95,
      "evidence": ["Spring @PostMapping"]
    }
  ],
  "datastores": ["PostgreSQL (Spring Data JPA)"]
}`,
    },
    go: {
        label: "Go (Gin)",
        badge: "Router AST + GORM",
        description: "Extracts Gin/Echo router definitions, HTTP verb registrations, and GORM database models.",
        code: `// Extracted Common Facts for Go / Gin
{
  "ecosystem": "go",
  "service": "inventory-service",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/inventory/:sku",
      "handler": "GetInventoryBySku",
      "source": { "file": "controllers/inventory.go", "line": 29 },
      "confidence": 0.95,
      "evidence": ["Gin router.GET()"]
    }
  ],
  "datastores": ["Redis", "PostgreSQL (GORM)"]
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
                        <Layers className="h-3 w-3 text-accent" /> Polyglot Analyzer Plugins
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Multi-Ecosystem Static Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
                        PushDoc extracts structured Common Facts from Node.js, Python, Java, and Go repositories automatically.
                    </p>
                </div>

                <Card className="bg-surface rounded-[6px] overflow-hidden border border-border">
                    <CardHeader className="p-3 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-xs font-mono text-text-secondary">Extracted Common Facts</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
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
                            <span className="text-text-muted text-xs font-mono">Traceable Evidence</span>
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
