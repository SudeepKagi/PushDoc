import React, { useState, useEffect, useRef } from "react";

const STEPS = [
    {
        id: 1,
        title: "Docs written by your commits.",
        desc: "PushDoc hooks into your GitHub workflow. Every push triggers an AI pipeline that reads your code and writes your README — automatically.",
        label: "HOW IT WORKS",
        panel: "Terminal Console",
    },
    {
        id: 2,
        title: "Webhook fires in milliseconds.",
        desc: "A secure, encrypted webhook POST is dispatched to api.pushdoc.io with zero-latency overhead — < 7ms payload parsing with HMAC-SHA256 verification.",
        label: "WEBHOOK LISTENER",
        panel: "Webhook — api.pushdoc.io",
    },
    {
        id: 3,
        title: "Deep workspace analysis.",
        desc: "Our engine clones the push diff, parses Express routes, Mongoose schemas, and compiles context blocks for the AI layer.",
        label: "AST ANALYZER",
        panel: "AstAnalyzer Engine",
    },
    {
        id: 4,
        title: "AI synthesizes context.",
        desc: "The code structure is fed into Gemini 2.5 Flash. Failover logic shifts queries to Groq if latency exceeds 1.5 seconds.",
        label: "AI GENERATION",
        panel: "AI Context Diff Generator",
    },
    {
        id: 5,
        title: "README committed back.",
        desc: "PushDoc generates clean, structured documentation and pushes a direct commit or pull request back into your branch.",
        label: "SYNC COMPLETE",
        panel: "README.md — Output Sync",
    },
];

export default function OnboardingPage({ handleLoginRedirect, setPage }) {
    const [step, setStep] = useState(1);

    // Step 1 terminal simulation
    const [terminalLines, setTerminalLines] = useState([
        "$ git commit -m",
        '"feat: add OAuth login"',
        "$ git push origin main ↵",
    ]);
    const [isPushing, setIsPushing] = useState(false);
    const terminalEndRef = useRef(null);

    // Step 3 scanner
    const [scannedFiles, setScannedFiles] = useState([]);
    const [scanProgress, setScanProgress] = useState(0);

    const runGitPushSim = () => {
        if (isPushing) return;
        setIsPushing(true);
        const lines = [
            "Enumerating objects: 7, done.",
            "Counting objects: 100% (7/7), done.",
            "Delta compression: 4 threads",
            "Writing objects: 100% (4/4), done.",
            "To github.com:sudeepkagi/PushDoc.git",
            "   8bf2e1a..4aef82b  main → main",
            "🚀 Webhook fired! Latency: 7ms",
            "✅ Push complete.",
        ];
        let index = 0;
        const interval = setInterval(() => {
            if (index < lines.length) {
                setTerminalLines(prev => [...prev, lines[index]]);
                index++;
            } else {
                clearInterval(interval);
                setIsPushing(false);
                setTimeout(() => setStep(2), 1200);
            }
        }, 300);
    };

    useEffect(() => {
        if (step === 3) {
            const files = [
                "package.json (parsed dependencies)",
                "src/server.js (identified entry point)",
                "src/routes/auth.routes.js (found 4 routes)",
                "src/models/User.model.js (detected Schema)",
                "src/controllers/auth.controller.js (extracted logic)",
                "src/middlewares/validate.js (analyzed chain)",
            ];
            setScannedFiles([]);
            setScanProgress(0);
            let idx = 0;
            const timer = setInterval(() => {
                if (idx < files.length) {
                    setScannedFiles(prev => [...prev, files[idx]]);
                    setScanProgress(Math.round(((idx + 1) / files.length) * 100));
                    idx++;
                } else {
                    clearInterval(timer);
                }
            }, 600);
            return () => clearInterval(timer);
        }
    }, [step]);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [terminalLines]);

    const current = STEPS[step - 1];

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
            {/* Back to site */}
            <div style={{ position: "absolute", top: "20px", right: "28px" }}>
                <button onClick={() => setPage("landing")}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#475569"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back to Site
                </button>
            </div>

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>

                {/* Left panel — step description */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 64px" }}>

                    {/* Progress dots */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "36px" }}>
                        {STEPS.map(s => (
                            <div key={s.id} style={{
                                height: "4px", flex: 1, borderRadius: "9999px",
                                background: s.id <= step ? "#1d4ed8" : "#e2e8f0",
                                transition: "background 0.3s",
                            }} />
                        ))}
                    </div>

                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "11px", fontWeight: 700, color: "#1d4ed8", letterSpacing: "0.04em", fontFamily: "'Space Grotesk', sans-serif", width: "fit-content", marginBottom: "20px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1d4ed8", display: "inline-block" }} />
                        {current.label}
                    </span>

                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 40px)", color: "#0f172a", lineHeight: 1.2, marginBottom: "20px", letterSpacing: "-0.02em" }}>
                        {current.title}
                    </h1>

                    <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.8, marginBottom: "40px", maxWidth: "400px" }}>
                        {current.desc}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                            disabled={step === 1}
                            onClick={() => setStep(prev => prev - 1)}
                            style={{
                                padding: "10px 20px", borderRadius: "9999px",
                                border: "1px solid #e2e8f0", background: "transparent",
                                color: step === 1 ? "#cbd5e1" : "#475569",
                                fontSize: "14px", fontWeight: 600,
                                cursor: step === 1 ? "not-allowed" : "pointer",
                                fontFamily: "'Space Grotesk', sans-serif",
                                transition: "all 0.2s",
                            }}>
                            Back
                        </button>

                        {step < 5 ? (
                            <button onClick={() => setStep(prev => prev + 1)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    padding: "12px 28px", borderRadius: "9999px",
                                    border: "none", background: "#1d4ed8", color: "#fff",
                                    fontSize: "14px", fontWeight: 700,
                                    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                                    boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#1e40af"}
                                onMouseLeave={e => e.currentTarget.style.background = "#1d4ed8"}>
                                Next
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        ) : (
                            <button onClick={() => setPage("dashboard")}
                                style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    padding: "12px 28px", borderRadius: "9999px",
                                    border: "none", background: "#1d4ed8", color: "#fff",
                                    fontSize: "14px", fontWeight: 700,
                                    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                                    boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#1e40af"}
                                onMouseLeave={e => e.currentTarget.style.background = "#1d4ed8"}>
                                Launch Dashboard
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        )}

                        <button onClick={() => setPage("dashboard")}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#94a3b8", padding: "10px 8px", fontFamily: "'Space Grotesk', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#475569"}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                            Skip Demo
                        </button>
                    </div>

                    <p style={{ marginTop: "32px", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Space Grotesk', sans-serif" }}>
                        STEP {step} OF {STEPS.length} — HOW PUSHDOC WORKS
                    </p>
                </div>

                {/* Right panel — interactive sandbox */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", background: "#f1f5f9" }}>
                    <div style={{ width: "100%", maxWidth: "480px" }}>
                        {/* Mock panel header — progress bar */}
                        <div style={{ height: "3px", background: "#e2e8f0", borderRadius: "9999px", marginBottom: "16px", overflow: "hidden" }}>
                            <div style={{ height: "100%", background: "#1d4ed8", width: `${(step / 5) * 100}%`, transition: "width 0.4s ease", borderRadius: "9999px" }} />
                        </div>

                        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 20px 48px rgba(0,0,0,0.08)" }}>
                            {/* Panel header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#f87171" }} />
                                    <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#fbbf24" }} />
                                    <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#34d399" }} />
                                </div>
                                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#94a3b8" }}>{current.panel}</span>
                                <div style={{ width: "60px" }} />
                            </div>

                            <div style={{ padding: "24px", minHeight: "340px", display: "flex", flexDirection: "column" }}>

                                {/* Step 1: Terminal */}
                                {step === 1 && (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ background: "#111827", borderRadius: "12px", padding: "16px", fontFamily: "monospace", fontSize: "12px", color: "#d1d5db", flex: 1, overflowY: "auto", maxHeight: "220px" }}>
                                            {terminalLines.map((line, idx) => (
                                                <div key={idx} style={{ marginBottom: "4px", color: (line.startsWith("🚀") || line.startsWith("✅")) ? "#34d399" : line.startsWith('"') ? "#fbbf24" : "#d1d5db" }}>
                                                    {line}
                                                </div>
                                            ))}
                                            <div ref={terminalEndRef} />
                                        </div>
                                        {/* Status items */}
                                        {[
                                            { label: "Pushing to GitHub...", color: "#94a3b8", dot: "#e2e8f0" },
                                            { label: "Webhook fired", color: "#f59e0b", dot: "#f59e0b" },
                                            { label: "PushDoc processing...", color: "#94a3b8", dot: "#e2e8f0" },
                                            { label: "README.md committed", color: "#059669", dot: "#059669" },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontSize: "12px", color: item.color }}>{item.label}</span>
                                                </div>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.dot }} />
                                            </div>
                                        ))}
                                        <button onClick={runGitPushSim} disabled={isPushing}
                                            style={{
                                                alignSelf: "flex-end", padding: "8px 18px", borderRadius: "9999px",
                                                border: "none", background: "#1d4ed8", color: "#fff",
                                                fontSize: "12px", fontWeight: 700, cursor: isPushing ? "not-allowed" : "pointer",
                                                fontFamily: "'Space Grotesk', sans-serif", opacity: isPushing ? 0.7 : 1,
                                                transition: "all 0.2s",
                                            }}>
                                            {isPushing ? "Pushing..." : "$ git push origin main"}
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Webhook */}
                                {step === 2 && (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", position: "relative", overflow: "hidden" }}>
                                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#059669" }} />
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9", marginBottom: "12px" }}>
                                                <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "monospace" }}>POST /webhooks/github</span>
                                                <span style={{ fontSize: "11px", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 10px", borderRadius: "9999px" }}>202 Accepted</span>
                                            </div>
                                            {[
                                                ["x-github-event:", "push", "#1d4ed8"],
                                                ["x-hub-signature:", "sha256=2a1c43b9c...", "#94a3b8"],
                                                ["repository:", "sudeepkagi/PushDoc", "#0f172a"],
                                                ["ref:", "refs/heads/main", "#94a3b8"],
                                            ].map(([k, v, c]) => (
                                                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>{k}</span>
                                                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: c, fontWeight: 600 }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", background: "#dcfce7", border: "1px solid #86efac", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, color: "#15803d" }}>
                                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                                                Fired Webhook
                                            </span>
                                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Latency: <strong style={{ color: "#0f172a" }}>7.2ms</strong></span>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Scanner */}
                                {step === 3 && (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                                            <span>Scanning modules...</span>
                                            <span>{scanProgress}%</span>
                                        </div>
                                        <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "9999px", overflow: "hidden" }}>
                                            <div style={{ background: "#1d4ed8", height: "100%", width: `${scanProgress}%`, transition: "width 0.4s ease", borderRadius: "9999px" }} />
                                        </div>
                                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", fontFamily: "monospace", fontSize: "11px", maxHeight: "200px", overflowY: "auto" }}>
                                            {scannedFiles.map((file, idx) => (
                                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#059669" }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                    {file}
                                                </div>
                                            ))}
                                            {scanProgress < 100 && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8" }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                    cloning workspace tree...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: AI Diff */}
                                {step === 4 && (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div style={{ background: "#111827", borderRadius: "12px", padding: "16px", fontFamily: "monospace", fontSize: "11px", flex: 1, overflowY: "auto" }}>
                                            <div style={{ color: "#475569", marginBottom: "8px" }}>{"// Diff synthesis from controller.js"}</div>
                                            <div style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "3px 8px", borderRadius: "4px", marginBottom: "4px" }}>- router.post("/login", validateInput);</div>
                                            {["+ /**", "+  * @route POST /api/v1/auth/login", "+  * @desc Logs in a verified user account", "+  * @access Public", "+  */", "+ router.post(\"/login\", authLimiter, validateInput, authController.loginUser);"].map((l, i) => (
                                                <div key={i} style={{ color: "#34d399", background: "rgba(52,211,153,0.08)", padding: "3px 8px", borderRadius: "4px", marginBottom: "2px" }}>{l}</div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                                                Gemini 2.5 Flash
                                            </span>
                                            <span>Tokens used: 1.4K</span>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: README output */}
                                {step === 5 && (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", flex: 1, overflowY: "auto" }}>
                                            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "16px", color: "#0f172a", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0", marginBottom: "12px" }}>PushDoc Automated Server</h2>
                                            <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.7, marginBottom: "12px" }}>This project is auto-monitored by PushDoc. Last synced <strong>just now</strong>.</p>
                                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "13px", color: "#0f172a", marginBottom: "8px" }}>API Endpoints</h3>
                                            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", fontFamily: "monospace", fontSize: "10px" }}>
                                                {[["POST /api/v1/auth/login", "public", "#059669"], ["GET /api/v1/user/profile", "verified", "#1d4ed8"], ["DELETE /api/v1/admin/purge", "admin only", "#dc2626"]].map(([endpoint, badge, color]) => (
                                                    <div key={endpoint} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                                                        <strong>{endpoint}</strong>
                                                        <span style={{ color, fontWeight: 700 }}>{badge}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                committed back to main
                                            </span>
                                            <button onClick={() => setPage("dashboard")}
                                                style={{ padding: "7px 16px", borderRadius: "9999px", border: "none", background: "#1d4ed8", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
                                                Open Dashboard
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
