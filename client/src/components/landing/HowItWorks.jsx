import React, { useState } from "react";

const STEPS = [
    {
        num: "01",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
        ),
        title: "Install the GitHub App",
        desc: "Authorize PushDoc on your GitHub organisation in one click. It gets read access to repos and write-only access to commit documentation back.",
        tag: "OAuth · < 30s",
        tagColor: "#1d4ed8", tagBg: "#eff6ff", tagBorder: "#bfdbfe",
        detail: "github.com/apps/pushdoc → Install",
        detailColor: "#1d4ed8",
        sample: [
            "✓ Read access: repository contents",
            "✓ Write access: README commits only",
            "✓ Webhook: push events",
        ],
    },
    {
        num: "02",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        title: "Push Code as Usual",
        desc: "Every git push fires a webhook to our worker. The diff is cloned, analyzers run in parallel — routes, schemas, controllers — and the AI layer synthesizes it all.",
        tag: "< 7ms response",
        tagColor: "#0284c7", tagBg: "#f0f9ff", tagBorder: "#bae6fd",
        detail: "POST /webhooks/github → 202 Accepted",
        detailColor: "#0284c7",
        sample: [
            "→ Analyzing 8 route endpoints",
            "→ Detecting 3 Mongoose schemas",
            "→ Routing to Gemini 2.5 Flash",
        ],
    },
    {
        num: "03",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        title: "README Committed Back",
        desc: "A structured, human-quality README is committed directly to your branch or opened as a PR — your preference, configurable per repository.",
        tag: "< 10s total",
        tagColor: "#059669", tagBg: "#ecfdf5", tagBorder: "#a7f3d0",
        detail: "[main 4aef82b] docs: auto-update README",
        detailColor: "#059669",
        sample: [
            "✓ README.md committed to main",
            "✓ 847 words generated",
            "✓ Skipped CI pipeline [skip ci]",
        ],
    },
];

export default function HowItWorks() {
    const [active, setActive] = useState(0);

    return (
        <section id="how-it-works" className="reveal" style={{ padding: "96px 24px", background: "#fff" }}>
            <div style={{ maxWidth: "1152px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "72px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontFamily: "'Space Grotesk', sans-serif" }}>
                        HOW IT WORKS
                    </p>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                        Three steps. Zero config.
                    </h2>
                    <p style={{ fontSize: "17px", fontWeight: 300, color: "#475569", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
                        From first push to living documentation in under two minutes.
                    </p>
                </div>

                {/* Two-column layout */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>

                    {/* Left: step selector */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {STEPS.map((step, i) => (
                            <button key={i} onClick={() => setActive(i)}
                                style={{
                                    textAlign: "left", width: "100%",
                                    padding: "20px 24px", borderRadius: "14px",
                                    border: active === i ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                                    background: active === i ? "#f8faff" : "#fff",
                                    cursor: "pointer",
                                    boxShadow: active === i ? "0 4px 20px rgba(29,78,216,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                                    transition: "all 0.25s ease",
                                }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                                        background: active === i ? "#eff6ff" : "#f8fafc",
                                        border: `1px solid ${active === i ? "#bfdbfe" : "#e2e8f0"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                                        fontSize: "13px", color: active === i ? "#1d4ed8" : "#94a3b8",
                                        transition: "all 0.25s",
                                    }}>
                                        {step.num}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{step.title}</span>
                                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", color: step.tagColor, background: step.tagBg, border: `1px solid ${step.tagBorder}`, fontFamily: "monospace" }}>
                                                {step.tag}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right: live preview panel */}
                    <div style={{ position: "sticky", top: "100px" }}>
                        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 20px 48px rgba(0,0,0,0.07)" }}>
                            {/* Panel header */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f87171" }} />
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" }} />
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#34d399" }} />
                                </div>
                                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#94a3b8", marginLeft: "8px" }}>
                                    step {String(active + 1).padStart(2, "0")} of {STEPS.length} — pushdoc worker
                                </span>
                            </div>

                            <div style={{ padding: "28px", background: "#ffffff", minHeight: "280px" }}>
                                {/* Step icon + title */}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: STEPS[active].tagColor }}>
                                        {STEPS[active].icon}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace", marginBottom: "2px" }}>step {STEPS[active].num}</p>
                                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{STEPS[active].title}</p>
                                    </div>
                                </div>

                                {/* Terminal command */}
                                <div style={{ borderRadius: "10px", padding: "14px 16px", background: "#0f172a", marginBottom: "20px", fontFamily: "monospace", fontSize: "12px" }}>
                                    <span style={{ color: "#475569" }}>$ </span>
                                    <span style={{ color: STEPS[active].detailColor }}>{STEPS[active].detail}</span>
                                    <span style={{ color: "rgba(255,255,255,0.3)" }}>▍</span>
                                </div>

                                {/* Output lines */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {STEPS[active].sample.map((line, j) => (
                                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#475569" }}>{line}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress dots */}
                                <div style={{ display: "flex", gap: "6px", marginTop: "24px", justifyContent: "center" }}>
                                    {STEPS.map((_, i) => (
                                        <button key={i} onClick={() => setActive(i)}
                                            style={{
                                                height: "5px", borderRadius: "9999px", border: "none", cursor: "pointer",
                                                width: active === i ? "24px" : "8px",
                                                background: active === i ? "#1d4ed8" : "#e2e8f0",
                                                transition: "all 0.3s ease", padding: 0,
                                            }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
