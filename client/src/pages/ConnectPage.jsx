import React from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ConnectPage({ handleLoginRedirect, setPage }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* SVG grid background */}
            <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                <svg style={{ height: "100%", width: "100%" }} aria-hidden="true">
                    <defs>
                        <pattern id="connect-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M.5 60V.5H60" fill="none" stroke="#3b82f6" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#connect-grid)" />
                </svg>
            </div>
            
            <div className="reveal active" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "480px" }}>
                <Card className="p-8 border border-outline-variant/30 bg-white/85 backdrop-blur-xl shadow-2xl rounded-3xl">
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "24px", color: "#0f172a", marginBottom: "8px" }}>
                            Connect to GitHub
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>
                            Authorize PushDoc to sync your repositories and automate README updates.
                        </p>
                    </div>

                    <div style={{ borderTop: "1px dashed #e2e8f0", borderBottom: "1px dashed #e2e8f0", padding: "20px 0", marginBottom: "28px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Requested Access Scopes</p>
                        
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Repository Contents (Read)</p>
                                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>To analyze codebase structure, routes, and database models.</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>README commits (Write)</p>
                                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>To commit the generated README files directly back to your branch.</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Webhook Events (Listen)</p>
                                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>To capture code pushes automatically and run our documentation worker.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Button
                            variant="primary"
                            onClick={handleLoginRedirect}
                            className="w-full py-3 flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Connect with GitHub
                        </Button>
                        
                        <Button
                            variant="secondary"
                            onClick={() => setPage("landing")}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
