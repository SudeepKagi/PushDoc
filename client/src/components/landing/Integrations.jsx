import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Cpu, Server, Database, GitBranch, Sparkles, Layers, Code, Workflow, Box } from "lucide-react";

const STACK = [
    { name: "Node.js & Express", cat: "JavaScript/TS", icon: Server, desc: "Parses Express routes, middleware, and Mongoose models." },
    { name: "Python & FastAPI", cat: "Python", icon: Code, desc: "Extracts FastAPI, Flask, and Django routes and SQLAlchemy ORMs." },
    { name: "Java & Spring Boot", cat: "Java/Kotlin", icon: Layers, desc: "Parses Spring Boot REST controllers and Spring Data JPA entities." },
    { name: "Go & Gin", cat: "Go", icon: Code, desc: "Extracts Gin/Echo router definitions and GORM database models." },
    { name: "OpenAPI & Docker", cat: "Infrastructure", icon: Box, desc: "Ingests OpenAPI 3.0 specifications and Docker Compose topologies." },
    { name: "Postgres, Mongo, Redis", cat: "Datastores", icon: Database, desc: "Maps database connections and caching layers into architecture graphs." },
    { name: "Gemini & Groq (BYOK)", cat: "AI Models", icon: Sparkles, desc: "Flexible routing to Google Gemini and Groq with custom API key support." },
    { name: "GitHub App & BullMQ", cat: "Automation", icon: GitBranch, desc: "HMAC-SHA256 authenticated webhooks and Redis background job queues." },
];

export default function Integrations() {
    return (
        <section id="integrations" className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-[4px] px-2.5 gap-1">
                        <Workflow className="h-3 w-3 text-accent" /> Supported Ecosystems
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Multi-language and framework support
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        PushDoc extracts structured architecture facts across polyglot backend services, ORMs, and specifications.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STACK.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Card key={idx} className="bg-surface-raised rounded-[6px] transition-colors">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary">
                                            <Icon className="h-4 w-4 text-accent" />
                                        </div>
                                        <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">
                                            {item.cat}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-primary">{item.name}</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
