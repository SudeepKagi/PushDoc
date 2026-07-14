import React from "react";
import LOGO_BASE64 from "../../logoBase64.js";

const PRODUCT_LINKS = [
    { label: "Solutions", href: "#features" },
    { label: "Product Engine", href: "#capabilities" },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
];

export default function LandingFooter({ handleLoginRedirect, setPage }) {
    const year = new Date().getFullYear();

    return (
        <>
            {/* ── CTA Banner ── */}
            <section style={{ padding: "96px 24px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.15 }}>
                        Ready to stop writing<br />
                        <span style={{ color: "#1d4ed8" }}>docs manually?</span>
                    </h2>
                    <p style={{ fontSize: "16px", fontWeight: 300, color: "#475569", marginBottom: "36px", lineHeight: 1.7 }}>
                        Connect your GitHub in 30 seconds. PushDoc handles everything else — forever.
                    </p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => setPage("connect")}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "#1d4ed8", color: "#fff",
                                border: "none", borderRadius: "9999px",
                                padding: "14px 30px", fontSize: "15px", fontWeight: 600,
                                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                                boxShadow: "0 8px 25px rgba(29,78,216,0.35)",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#1e40af"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(29,78,216,0.5)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(29,78,216,0.35)"; }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Get Started — It's free
                        </button>
                        <a href="#features" style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            fontSize: "14px", fontWeight: 500, color: "#475569",
                            textDecoration: "none", padding: "14px 20px", borderRadius: "9999px",
                            border: "1px solid #e2e8f0", transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "transparent"; }}>
                            View features →
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "64px 24px 40px" }}>
                <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "48px", paddingBottom: "48px" }}>
                        {/* Brand */}
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 300, color: "#475569", lineHeight: 1.8, maxWidth: "260px", marginBottom: "16px" }}>
                                The automation layer for your codebase documentation.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <img src={LOGO_BASE64} alt="PushDoc" style={{ height: "22px", width: "auto" }} />
                                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>PushDoc</span>
                            </div>
                        </div>

                        {/* Product links */}
                        <div>
                            <h4 style={{ fontSize: "11px", fontWeight: 600, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>Product</h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                {PRODUCT_LINKS.map(l => (
                                    <li key={l.label}>
                                        <a href={l.href} style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", transition: "color 0.2s" }}
                                            onMouseEnter={e => e.target.style.color = "#1d4ed8"}
                                            onMouseLeave={e => e.target.style.color = "#64748b"}>
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal links */}
                        <div>
                            <h4 style={{ fontSize: "11px", fontWeight: 600, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>Legal</h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                {LEGAL_LINKS.map(l => (
                                    <li key={l.label}>
                                        <a href={l.href} style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", transition: "color 0.2s" }}
                                            onMouseEnter={e => e.target.style.color = "#1d4ed8"}
                                            onMouseLeave={e => e.target.style.color = "#64748b"}>
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "24px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>© {year} PushDoc Inc.</span>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            {/* X (Twitter) icon */}
                            <a href="#" style={{ color: "#94a3b8", transition: "color 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
                                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.726-8.84L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* GitHub icon */}
                            <a href="#" style={{ color: "#94a3b8", transition: "color 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
                                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
