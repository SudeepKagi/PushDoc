import React, { useState, useEffect } from "react";
import LOGO_BASE64 from "../../logoBase64.js";

const NAV_LINKS = [
    { label: "Solutions", href: "#features" },
    { label: "Features", href: "#capabilities" },
];

export default function Navbar({ page, setPage, user, handleLoginRedirect, logout }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isLanding = page === "landing";

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            transition: "all 0.5s ease",
            background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(203,213,225,0.5)" : "1px solid transparent",
            boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
        }}>
            <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 64px" }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: scrolled ? "56px" : "72px", transition: "height 0.5s ease",
                }}>
                    {/* Logo */}
                    <button onClick={() => setPage("landing")} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}>
                        <img src={LOGO_BASE64} alt="PushDoc" style={{ height: "26px", width: "auto" }} />
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "17px", color: "#0f172a" }}>
                            PushDoc
                        </span>
                    </button>

                    {/* Desktop nav — centered like DaemonDoc */}
                    {isLanding && (
                        <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
                            {NAV_LINKS.map(l => (
                                <a key={l.label} href={l.href} style={{
                                    fontSize: "14px", fontWeight: 500, color: "#475569",
                                    textDecoration: "none", transition: "color 0.2s",
                                }}
                                    onMouseEnter={e => e.target.style.color = "#1d4ed8"}
                                    onMouseLeave={e => e.target.style.color = "#475569"}>
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {user && !isLanding ? (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {user.avatarUrl && <img src={user.avatarUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />}
                                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{user.username}</span>
                                </div>
                                <button onClick={() => { logout(); setPage("landing"); }}
                                    style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setPage("connect")} style={{
                                background: "#1d4ed8", color: "#fff",
                                border: "none", borderRadius: "9999px",
                                padding: "10px 22px", fontSize: "14px", fontWeight: 600,
                                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                                boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
                                transition: "all 0.2s ease",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#1e40af"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(29,78,216,0.45)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(29,78,216,0.3)"; }}>
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
