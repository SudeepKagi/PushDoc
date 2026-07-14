import React, { useState } from "react";

const FEATURES = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
                <path d="M6 12a4 4 0 0 0-4 4c0 2.2 1.8 4 4 4h12a4 4 0 0 0 4-4 4 4 0 0 0-4-4" />
                <line x1="12" y1="10" x2="12" y2="12" />
            </svg>
        ),
        iconBg: "#eff6ff",
        title: "Intelligent Code Analysis",
        desc: ["Powered by the latest ", "Gemini & Groq models", ", our engine deeply understands your codebase structure, logic, and intent to generate human-quality documentation."],
        gradient: "feature-gradient-1",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.016c.54.155.99.39 1.328.703.68.624.672 1.45 0 2.063C18.608 19.396 17.367 19.7 16 19.7c-1.367 0-2.608-.304-3.328-.918" />
                <path d="M2 9.016c0-.87.736-1.678 2-2.203C5.28 6.148 6.576 5.7 8 5.7s2.72.448 4 1.113" />
                <ellipse cx="8" cy="9.7" rx="6" ry="2.3" />
                <path d="M2 9.7v5c0 1.27 2.686 2.3 6 2.3M22 12.7V9.7" />
                <ellipse cx="16" cy="14.7" rx="6" ry="2.3" />
                <path d="M10 14.7v5c0 1.27 2.686 2.3 6 2.3s6-1.03 6-2.3v-5" />
            </svg>
        ),
        iconBg: "#f0f9ff",
        title: "Real-time Webhook Integration",
        desc: ["The ", "push once, sync forever", " promise. We listen for git events in real-time, ensuring your README is never out of date with your actual code."],
        gradient: "feature-gradient-2",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
        iconBg: "#ecfdf5",
        title: "Enterprise-Grade Security",
        desc: ["Your code stays yours. All GitHub tokens and repository access keys are protected with ", "AES-256 encryption", " at rest and in transit."],
        gradient: "feature-gradient-3",
    },
];

const ENGINE_CAPABILITIES = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
        ),
        iconBg: "#eff6ff",
        label: "GITHUB OAUTH 2.0",
        desc: "Secure handshake protocols ensuring precise permission scoping for your private repositories.",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        iconBg: "#eef2ff",
        label: "CONTEXT SYNTHESIS",
        desc: "Static analysis engine that aggregates cross-file dependencies and project structure for holistic doc generation.",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        iconBg: "#ecfeff",
        label: "DIFFERENTIAL SCAN",
        desc: "Compute-efficient audits that only process modified AST nodes to minimize latency.",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
        ),
        iconBg: "#fffbeb",
        label: "COMMIT ISOLATION",
        desc: "Granular tracking of change-sets to provide accurate version histories within your README.",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
        ),
        iconBg: "#fef2f2",
        label: "MULTI-LLM FAILOVER",
        desc: "Seamless routing across Gemini & Groq with key rotation and automatic failover for maximum uptime.",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
        iconBg: "#f5f3ff",
        label: "LOGIC EXCLUSIONS",
        desc: "Smart filtering to omit boilerplate, tests, and sensitive configuration from public docs.",
    },
];

export default function Features() {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredEngine, setHoveredEngine] = useState(null);

    return (
        <>
            {/* ── Core Capabilities ── */}
            <section id="features" className="reveal" style={{ background: "#ffffff", padding: "96px 24px 80px" }}>
                <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto 72px", textAlign: "center" }}>
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: "#0f172a", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                            Core Capabilities
                        </h2>
                        <p style={{ fontSize: "17px", fontWeight: 300, color: "#475569", lineHeight: 1.7 }}>
                            Everything you need to maintain perfect documentation without lifting a finger.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
                        {FEATURES.map((f, i) => (
                            <div key={i}
                                className={`card-hover ${f.gradient}`}
                                onMouseEnter={() => setHoveredCard(i)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    borderRadius: "16px",
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    padding: "32px",
                                    cursor: "default",
                                }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "18px", color: "#0f172a", marginBottom: "12px" }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.8 }}>
                                    {f.desc[0]}<strong style={{ color: "#0f172a" }}>{f.desc[1]}</strong>{f.desc[2]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Engine Capabilities ── */}
            <section id="capabilities" className="reveal" style={{ padding: "96px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "64px" }}>
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3.5vw, 36px)", color: "#0f172a", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: "16px" }}>
                            Everything the Engine Does
                        </h2>
                        <p style={{ fontSize: "16px", fontWeight: 300, color: "#64748b", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
                            Deep-tech capabilities powering the next generation of automated documentation.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                        {ENGINE_CAPABILITIES.map((cap, i) => (
                            <div key={i}
                                className="card-hover"
                                onMouseEnter={() => setHoveredEngine(i)}
                                onMouseLeave={() => setHoveredEngine(null)}
                                style={{
                                    background: "#fff", border: "1px solid #e2e8f0",
                                    borderRadius: "14px", padding: "28px",
                                }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: cap.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                                    {cap.icon}
                                </div>
                                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", color: "#0f172a", letterSpacing: "0.04em", marginBottom: "10px" }}>
                                    {cap.label}
                                </p>
                                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7 }}>{cap.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
