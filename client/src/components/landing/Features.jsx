import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Network, Database, AlertTriangle, Layers, Code2, Sparkles } from "lucide-react";

const BENTO_CARDS = [
    {
        icon: Network,
        title: "Polyglot Service Analysis",
        desc: "Extracts Express, FastAPI, Spring Boot, and Go routes into normalized, traceable Common Facts with line-level evidence.",
    },
    {
        icon: Database,
        title: "Database Models & ORMs",
        desc: "Parses Mongoose schemas, SQLAlchemy models, and Spring Data JPA entities with fields, constraints, and relationships.",
    },
    {
        icon: AlertTriangle,
        title: "Contract Drift Detection",
        desc: "Compares OpenAPI specifications against actual code routes and flags undeclared environment variables automatically.",
    },
    {
        icon: Layers,
        title: "Architecture Graph Engine",
        desc: "Resolves inter-service HTTP calls, Kafka pub/sub message topics, datastore connections, and external SaaS APIs.",
    },
    {
        icon: Code2,
        title: "Automated Mermaid Diagrams",
        desc: "Renders deterministic system topology diagrams and subgraphs directly from the verified code architecture graph.",
    },
    {
        icon: Sparkles,
        title: "Evidence-Grounded AI Docs",
        desc: "Synthesizes comprehensive README documentation grounded strictly in verified static facts with 100-point validation.",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-16 bg-bg border-t border-border font-sans">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                        Evidence-backed repository intelligence.
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Deterministic static analysis, cross-service correlation, and grounded documentation for full-stack and polyglot codebases.
                    </p>
                </div>

                {/* 6-Bento Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BENTO_CARDS.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Card key={idx} className="bg-surface-raised rounded-[6px] transition-colors">
                                <CardContent className="p-4 space-y-2">
                                    <div className="h-8 w-8 rounded-[4px] bg-surface flex items-center justify-center text-text-primary mb-2">
                                        <Icon className="h-4 w-4 text-accent" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-primary">{card.title}</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {card.desc}
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
