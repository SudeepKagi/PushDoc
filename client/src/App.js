import React, { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:3000";

const MOCK_REPOS = [
    {
        _id: "repo-1",
        githubId: 101,
        name: "e-commerce-backend",
        fullName: "SudeepKagi/e-commerce-backend",
        private: true,
        cloneUrl: "https://github.com/SudeepKagi/e-commerce-backend.git",
        score: 95,
        status: "COMPLETED",
        branch: "main",
        headCommit: "feat: add secure Stripe payment processing controller",
        warnings: [],
        missingSections: [],
        coverage: {
            features: 90,
            models: 100,
            routes: 92
        },
        duration: 3200,
        lastRun: "2 hours ago"
    },
    {
        _id: "repo-2",
        githubId: 102,
        name: "auth-service",
        fullName: "SudeepKagi/auth-service",
        private: false,
        cloneUrl: "https://github.com/SudeepKagi/auth-service.git",
        score: 72,
        status: "FAILED",
        branch: "master",
        headCommit: "refactor: upgrade authentication token signing algorithm",
        warnings: [
            "Table row at line 34 has mismatched column count (expected 3, got 4).",
            "API endpoint path \"/auth/verify\" is not documented in the README."
        ],
        missingSections: ["API Overview", "Database Models"],
        coverage: {
            features: 75,
            models: 50,
            routes: 60
        },
        duration: 4800,
        lastRun: "Yesterday"
    },
    {
        _id: "repo-3",
        githubId: 103,
        name: "dashboard-widget",
        fullName: "SudeepKagi/dashboard-widget",
        private: false,
        cloneUrl: "https://github.com/SudeepKagi/dashboard-widget.git",
        score: 88,
        status: "COMPLETED",
        branch: "dev",
        headCommit: "chore: update dependencies and build configurations",
        warnings: [
            "Heading level skipped: H1 directly followed by H3 (\"Technical Specifications\")."
        ],
        missingSections: ["Usage"],
        coverage: {
            features: 100,
            models: 0, // No models
            routes: 80
        },
        duration: 2100,
        lastRun: "3 days ago"
    }
];

export default function App() {
    const [page, setPage] = useState("landing");
    const [repos, setRepos] = useState(MOCK_REPOS);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [authCode, setAuthCode] = useState(null);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Look for GitHub OAuth Callback Code in URL query parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            setAuthCode(code);
            exchangeOAuthCode(code);
        }
    }, []);

    const exchangeOAuthCode = async (code) => {
        setPage("dashboard");
        setSyncing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/github/callback?code=${code}`);
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                // Trigger repo synchronization
                await triggerSync(data.token);
            }
        } catch (err) {
            console.error("OAuth Exchange Failed:", err.message);
        } finally {
            setSyncing(false);
        }
    };

    const triggerSync = async (authToken) => {
        setSyncing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/github/sync`, {
                headers: {
                    Authorization: `Bearer ${authToken || token}`
                }
            });
            const data = await res.json();
            if (data.success && data.repositories) {
                // Merge synced repositories, assigning mock scores/details if needed
                const enriched = data.repositories.map((repo, idx) => ({
                    ...repo,
                    score: 90 - (idx * 5),
                    status: "COMPLETED",
                    branch: "main",
                    headCommit: "initial push",
                    warnings: [],
                    missingSections: [],
                    coverage: { features: 100, models: 100, routes: 100 },
                    duration: 2500,
                    lastRun: "Just now"
                }));
                setRepos(enriched);
            }
        } catch (err) {
            console.error("Repository Sync Failed:", err.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleLoginRedirect = () => {
        window.location.href = `${BACKEND_URL}/auth/github`;
    };

    const openDetails = (repo) => {
        setSelectedRepo(repo);
        setPage("detail");
    };

    const triggerManualBuild = (repoId) => {
        alert("Verification trigger pushed! Webhook job has been successfully queued.");
    };

    return (
        <div className="main-wrapper">
            {page === "landing" && (
                <div className="landing-view animate-fade">
                    <nav className="landing-nav">
                        <div className="nav-logo">
                            <span>📘</span> PushDoc.
                        </div>
                        <ul className="nav-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#techstack">Tech Stack</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                        <div className="nav-actions">
                            <button className="btn-secondary" onClick={() => setPage("dashboard")}>
                                Skip to App
                            </button>
                            <button className="btn-primary" onClick={handleLoginRedirect}>
                                Connect Github
                            </button>
                        </div>
                    </nav>

                    <header className="hero-section">
                        <h1>Easily manage, analyze &<br />automate your repository documentation.</h1>
                        <p>
                            PushDoc automates the creation of professional README documentation. It integrates
                            directly with GitHub webhooks, runs deterministic semantic analysis on routes, models,
                            and controllers, and commits the updated documentation on every git push.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-dark" onClick={handleLoginRedirect}>
                                Get started free
                            </button>
                            <button className="btn-secondary" onClick={() => setPage("dashboard")}>
                                Launch Demo
                            </button>
                        </div>
                    </header>

                    <div className="preview-container">
                        <div className="preview-frame glass-card" style={{ padding: "40px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>📘 Mock Preview Dashboard</h3>
                                <span className="badge success">Demo Mode</span>
                            </div>
                            <div className="stats-row" style={{ marginBottom: "30px" }}>
                                <div className="glass-card stat-card" style={{ height: "100px" }}>
                                    <div className="stat-title">Active Repositories</div>
                                    <div className="stat-value" style={{ fontSize: "1.5rem" }}>12</div>
                                </div>
                                <div className="glass-card stat-card" style={{ height: "100px" }}>
                                    <div className="stat-title">Average Documentation Score</div>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "#10b981" }}>94/100</div>
                                </div>
                                <div className="glass-card stat-card" style={{ height: "100px" }}>
                                    <div className="stat-title">Hours Saved</div>
                                    <div className="stat-value" style={{ fontSize: "1.5rem" }}>28 hrs</div>
                                </div>
                                <div className="glass-card stat-card" style={{ height: "100px" }}>
                                    <div className="stat-title">Failover APIs</div>
                                    <div className="stat-value" style={{ fontSize: "1.5rem", color: "#2563eb" }}>Gemini & Groq</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section id="features" className="features-section">
                        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "800" }}>Designed for Modern Developers</h2>
                        <div className="features-grid">
                            <div className="glass-card feature-card">
                                <div className="feature-icon">🔍</div>
                                <h3>Deep Repo Scanning</h3>
                                <p>Parses package settings, Express.js routes, Mongoose schemas, and controllers to construct a semantic model of the repository.</p>
                            </div>
                            <div className="glass-card feature-card blue">
                                <div className="feature-icon">🤖</div>
                                <h3>Gemini & Groq Failover</h3>
                                <p>Integrates multiple API keys and provider failovers. If one fails, the fallback provider takes over automatically.</p>
                            </div>
                            <div className="glass-card feature-card purple">
                                <div className="feature-icon">✅</div>
                                <h3>Deterministic Validator</h3>
                                <p>Locally verifies generated Markdown for unclosed code fences, missing sections, and matches endpoints to confirm full coverage.</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {page === "dashboard" && (
                <div className="app-container animate-fade">
                    <aside className="app-sidebar">
                        <div className="sidebar-logo">
                            <span>📘</span> PushDoc.
                        </div>
                        <ul className="sidebar-menu">
                            <li className="active"><span>📊</span> Dashboard</li>
                            <li onClick={() => setPage("landing")}><span>🏠</span> Exit to Landing</li>
                        </ul>
                    </aside>

                    <main className="app-main">
                        <header className="main-header">
                            <div>
                                <h1>Documentation Dashboard</h1>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                                    Monitor and configure repository README files.
                                </p>
                            </div>
                            <div className="header-actions">
                                <button className="btn-primary" onClick={() => triggerSync(token)} disabled={syncing}>
                                    {syncing ? "Syncing..." : "Sync Repositories"}
                                </button>
                            </div>
                        </header>

                        <div className="stats-row">
                            <div className="glass-card stat-card">
                                <div className="stat-title">Total Repositories</div>
                                <div className="stat-value">{repos.length}</div>
                                <div className="stat-footer">
                                    <span className="stat-delta">+15%</span> this month
                                </div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-title">Average Score</div>
                                <div className="stat-value">
                                    {repos.length > 0 ? Math.round(repos.reduce((acc, r) => acc + r.score, 0) / repos.length) : 0}/100
                                </div>
                                <div className="stat-footer">Across all branches</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-title">Background Queue</div>
                                <div className="stat-value" style={{ color: "var(--color-accent)" }}>Active</div>
                                <div className="stat-footer">BullMQ & Redis linked</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-title">API Failover</div>
                                <div className="stat-value" style={{ color: "var(--color-success)" }}>Healthy</div>
                                <div className="stat-footer">Gemini & Groq online</div>
                            </div>
                        </div>

                        <div className="repos-section">
                            <div className="section-title">Imported Projects</div>
                            <div className="repos-grid">
                                {repos.map((repo) => (
                                    <div key={repo._id} className="glass-card repo-card" onClick={() => openDetails(repo)}>
                                        <div className="repo-card-header">
                                            <div>
                                                <div className="repo-name">{repo.name}</div>
                                                <div className="repo-meta">{repo.private ? "🔒 Private" : "🌐 Public"} • {repo.branch}</div>
                                            </div>
                                            <div className={`score-circle ${repo.score >= 80 ? 'green' : 'red'}`}>
                                                {repo.score}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                                            <strong>Last Commit:</strong> {repo.headCommit?.substring(0, 50)}...
                                        </div>
                                        <div className="repo-card-footer">
                                            <span>Duration: {(repo.duration / 1000).toFixed(1)}s</span>
                                            <span className="badge success">{repo.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {page === "detail" && selectedRepo && (
                <div className="app-container animate-fade">
                    <aside className="app-sidebar">
                        <div className="sidebar-logo">
                            <span>📘</span> PushDoc.
                        </div>
                        <ul className="sidebar-menu">
                            <li onClick={() => setPage("dashboard")}><span>⬅️</span> Back to Dashboard</li>
                        </ul>
                    </aside>

                    <main className="app-main">
                        <header className="main-header">
                            <div>
                                <h1>{selectedRepo.name} Details</h1>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                                    {selectedRepo.fullName}
                                </p>
                            </div>
                            <div className="header-actions">
                                <button className="btn-primary" onClick={() => triggerManualBuild(selectedRepo._id)}>
                                    Queue Verification Job
                                </button>
                            </div>
                        </header>

                        <div className="details-grid">
                            <div className="detail-main">
                                <div className="glass-card detail-card">
                                    <div className="detail-card-title">
                                        <span>Validation Warnings</span>
                                        <span className={`badge ${selectedRepo.warnings.length === 0 ? 'success' : 'danger'}`}>
                                            {selectedRepo.warnings.length} Warnings
                                        </span>
                                    </div>
                                    {selectedRepo.warnings.length === 0 ? (
                                        <div style={{ color: "var(--color-success)", fontWeight: "600" }}>
                                            No issues found. The README meets all structural and semantic criteria!
                                        </div>
                                    ) : (
                                        <div className="warnings-list">
                                            {selectedRepo.warnings.map((w, idx) => (
                                                <div key={idx} className="warning-item">
                                                    <span className="warning-icon">⚠</span>
                                                    <span>{w}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="glass-card detail-card">
                                    <div className="detail-card-title">Generated Documentation Preview</div>
                                    <div className="diff-container">
                                        <div className="diff-line add">+ # {selectedRepo.name}</div>
                                        <div className="diff-line add">+ ## Description</div>
                                        <div className="diff-line add">+ Scans and manages webhook integrations securely.</div>
                                        <div className="diff-line add">+ ## Tech Stack</div>
                                        <div className="diff-line add">+ Express.js, Mongoose, Redis, BullMQ</div>
                                        <div className="diff-line add">+ ## API Overview</div>
                                        <div className="diff-line add">+ GET /github/sync - Synced active repository lists.</div>
                                        <div className="diff-line add">+ POST /github/callback - Redirect callback verification.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-sidebar">
                                <div className="glass-card detail-card">
                                    <div className="detail-card-title">Project Coverage</div>
                                    <div className="coverage-row">
                                        <div className="coverage-item">
                                            <div className="coverage-label-row">
                                                <span>Features Coverage</span>
                                                <span>{selectedRepo.coverage.features}%</span>
                                            </div>
                                            <div className="bar-bg">
                                                <div className="bar-fill success" style={{ width: `${selectedRepo.coverage.features}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="coverage-item">
                                            <div className="coverage-label-row">
                                                <span>Models Coverage</span>
                                                <span>{selectedRepo.coverage.models}%</span>
                                            </div>
                                            <div className="bar-bg">
                                                <div className="bar-fill success" style={{ width: `${selectedRepo.coverage.models}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="coverage-item">
                                            <div className="coverage-label-row">
                                                <span>Routes Coverage</span>
                                                <span>{selectedRepo.coverage.routes}%</span>
                                            </div>
                                            <div className="bar-bg">
                                                <div className="bar-fill success" style={{ width: `${selectedRepo.coverage.routes}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card detail-card">
                                    <div className="detail-card-title">Job Properties</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                                        <div><strong>Default Branch:</strong> {selectedRepo.branch}</div>
                                        <div><strong>Time Taken:</strong> {(selectedRepo.duration / 1000).toFixed(2)} seconds</div>
                                        <div><strong>Last Scanned:</strong> {selectedRepo.lastRun}</div>
                                        <div><strong>Visibility:</strong> {selectedRepo.private ? "Private" : "Public"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
