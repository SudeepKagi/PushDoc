import React, { useState } from "react";
import LOGO_BASE64 from "../../logoBase64.js";

// Floating tech language icons — aligned lower to match text block
const FLOATING_ICONS = [
    { id: "node", bg: "#339933", logo: "https://cdn.simpleicons.org/nodedotjs/ffffff", pos: { top: "140px", left: "20px" }, rotate: "-6deg", anim: "animate-float" },
    { id: "ts", bg: "#3178c6", logo: "https://cdn.simpleicons.org/typescript/ffffff", pos: { top: "260px", left: "80px" }, rotate: "12deg", anim: "animate-float-d" },
    { id: "go", bg: "#00acd7", logo: "https://cdn.simpleicons.org/go/ffffff", pos: { top: "390px", left: "30px" }, rotate: "-3deg", anim: "animate-float" },
    { id: "js", bg: "#f0db4f", logo: "https://cdn.simpleicons.org/javascript/000000", pos: { top: "150px", right: "30px" }, rotate: "6deg", anim: "animate-float-d" },
    { id: "py", bg: "#3572A5", logo: "https://cdn.simpleicons.org/python/ffffff", pos: { top: "280px", right: "90px" }, rotate: "-12deg", anim: "animate-float" },
    { id: "react", bg: "#20232a", logo: "https://cdn.simpleicons.org/react/61dafb", pos: { top: "400px", right: "20px" }, rotate: "3deg", anim: "animate-float-d" },
];

// 3-step flow cards
const STEPS = [
    {
        num: "1",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
        ),
        title: "Connect Repo",
        desc: "Link your GitHub repository once",
        iconBg: "#eff6ff", iconBorder: "#bfdbfe",
    },
    {
        num: "2",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        title: "Push Code",
        desc: "Just code & commit as usual",
        iconBg: "#f0f9ff", iconBorder: "#bae6fd",
    },
    {
        num: "3",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        ),
        title: "README Updates",
        desc: "Docs sync automatically & instantly",
        iconBg: "#ecfdf5", iconBorder: "#a7f3d0",
    },
];

export default function Hero({ handleLoginRedirect, setPage }) {
    const [hovered, setHovered] = useState(null);

    return (
        <main id="hero" style={{ position: "relative", overflow: "hidden", paddingTop: "152px", paddingBottom: "80px", background: "#f8fafc" }}>

            {/* SVG grid background */}
            <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                <svg style={{ height: "100%", width: "100%" }} aria-hidden="true">
                    <defs>
                        <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M.5 60V.5H60" fill="none" stroke="#3b82f6" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-grid)" />
                </svg>
            </div>

            {/* Gradient wash */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "linear-gradient(to bottom, transparent, rgba(207,250,254,0.25), #f8fafc)" }} />

            {/* Centered Floating tech icons wrapper */}
            <div className="hidden lg:block" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
                <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", height: "100%" }}>
                    {FLOATING_ICONS.map(icon => (
                        <div key={icon.id} className={icon.anim} style={{
                            position: "absolute", ...icon.pos, pointerEvents: "none",
                        }}>
                            <div style={{
                                width: "38px", height: "38px",
                                borderRadius: "9px", background: icon.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transform: `rotate(${icon.rotate})`,
                                boxShadow: "0 4px 14px rgba(100,116,139,0.18)",
                            }}>
                                <img src={icon.logo} alt={icon.id} style={{ width: "22px", height: "22px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div style={{ position: "relative", zIndex: 10, maxWidth: "880px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

                {/* Eyebrow badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "28px", padding: "5px 14px", borderRadius: "9999px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1d4ed8", display: "inline-block" }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#1d4ed8", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em" }}>
                        git push → README auto-updates
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 6vw, 68px)", lineHeight: 1.08, color: "#0f172a", marginBottom: "24px", letterSpacing: "-0.02em" }}>
                    Keep your README in sync with{" "}
                    <span style={{
                        position: "relative", display: "inline-block",
                        color: "#1d4ed8", background: "rgba(239,246,255,0.6)",
                        border: "1px solid #bfdbfe",
                        borderBottom: "none",
                        borderRadius: "8px 8px 0 0",
                        padding: "0 10px",
                        fontWeight: 800,
                    }}>
                        every single commit
                        <svg style={{ position: "absolute", bottom: "-8px", left: 0, width: "100%", height: "8px", color: "rgba(29,78,216,0.4)" }}
                            viewBox="0 0 200 8" preserveAspectRatio="none">
                            <path d="M0 4 Q 50 0 100 4 T 200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                <p style={{ fontSize: "clamp(16px, 2vw, 19px)", fontWeight: 300, color: "#475569", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto 36px", fontFamily: "'Inter', sans-serif" }}>
                    Connect your repository once. PushDoc automatically parses your commits, analyzes your codebase structure, and keeps your documentation updated.
                </p>

                {/* CTA buttons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", alignItems: "center", marginBottom: "72px" }}>
                    <button onClick={() => setPage("connect")}
                        style={{
                            position: "relative", overflow: "hidden",
                            display: "flex", alignItems: "center", gap: "10px",
                            background: "#1d4ed8", color: "#fff",
                            border: "none", borderRadius: "9999px",
                            padding: "14px 32px", fontSize: "15px", fontWeight: 600,
                            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                            boxShadow: "0 8px 25px rgba(29,78,216,0.35)",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#1e40af"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(29,78,216,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(29,78,216,0.35)"; }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Try Now →
                    </button>
                    <a href="#features" style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        fontSize: "14px", fontWeight: 500, color: "#475569",
                        textDecoration: "none", padding: "14px 20px", borderRadius: "9999px",
                        transition: "background 0.2s",
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(203,213,225,0.25)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        View Capabilities →
                    </a>
                </div>

                {/* 3-step flow */}
                <div className="reveal" style={{ maxWidth: "768px", margin: "0 auto 52px" }}>
                    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                        {/* Dashed connector */}
                        <div style={{ position: "absolute", top: "28px", left: 0, right: 0, height: "56px", pointerEvents: "none", zIndex: 0 }}>
                            <svg width="100%" height="56" viewBox="0 0 760 56" fill="none" preserveAspectRatio="none">
                                <line x1="120" y1="28" x2="640" y2="28" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.4"
                                    style={{ animation: "dash-flow 3s linear infinite" }} />
                            </svg>
                        </div>
                        {STEPS.map((step, i) => (
                            <div key={i}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    position: "relative", zIndex: 1,
                                    background: hovered === i ? "#ffffff" : "rgba(255,255,255,0.7)",
                                    border: "1px dashed #e2e8f0",
                                    borderRadius: "14px", padding: "20px 16px",
                                    backdropFilter: "blur(4px)",
                                    boxShadow: hovered === i ? "0 20px 40px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                                    transition: "all 0.25s ease",
                                }}>
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "50%",
                                    background: step.iconBg, border: `1px solid ${step.iconBorder}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 12px",
                                    boxShadow: hovered === i ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                                    transition: "box-shadow 0.25s",
                                }}>
                                    {step.icon}
                                </div>
                                <p style={{ fontWeight: 700, color: "#0f172a", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "4px", fontSize: "14px" }}>
                                    {step.num}. {step.title}
                                </p>
                                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Demo Mockup */}
                <div className="reveal" style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
                    <div className="animate-pulse-glow" style={{
                        position: "absolute", inset: "-4px",
                        borderRadius: "16px",
                        background: "linear-gradient(to right, #3b82f6, #0ea5e9)",
                        opacity: 0.12, filter: "blur(2px)",
                    }} />
                    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 32px 64px rgba(0,0,0,0.07)" }}>
                        {/* Browser chrome */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f87171" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#fbbf24" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#34d399" }} />
                            </div>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "#fff", borderRadius: "6px", padding: "4px 40px", fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                pushdoc.dev/demo
                            </div>
                        </div>
                        {/* Video mockup */}
                        <div style={{ position: "relative", background: "#0b0f19", minHeight: "380px", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", color: "#94a3b8", textAlign: "center" }}>
                                <button style={{
                                    width: "72px", height: "72px", borderRadius: "50%",
                                    background: "rgba(29,78,216,0.95)", border: "none",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#fff", boxShadow: "0 10px 30px rgba(29,78,216,0.45)",
                                    transition: "transform 0.2s, background 0.2s",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "4px" }}>
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                                <div>
                                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "4px" }}>Watch PushDoc in Action</p>
                                    <p style={{ fontSize: "12px", color: "#64748b" }}>See how code commits instantly sync with documentation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom fade */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to top, #fff, transparent)", pointerEvents: "none", zIndex: 11 }} />
        </main>
    );
}
