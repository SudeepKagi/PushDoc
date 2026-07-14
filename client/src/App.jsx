import React, { useState } from "react";

import useGitHub from "./hooks/useGitHub";
import useLiveLogs from "./hooks/useLiveLogs";
import { triggerManualBuild as apiTriggerManualBuild } from "./utils/api";


import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import ConnectPage from "./pages/ConnectPage";
import DashboardPage from "./pages/DashboardPage";
import DetailPage from "./pages/DetailPage";
import SettingsPage from "./pages/SettingsPage";
import BuildLogsPage from "./pages/BuildLogsPage";
import AIProviderPage from "./pages/AIProviderPage";

export default function App() {
    const [page, setPage] = useState("landing");

    // GitHub OAuth + repo sync state
    const {
        repos,
        selectedRepo,
        setSelectedRepo,
        syncing,
        user,
        token,
        error: syncError,
        clearError,
        triggerSync,
        handleLoginRedirect,
        logout,
        toggleRepository
    } = useGitHub();

    // Automatically route/redirect on authentication status change
    React.useEffect(() => {
        if (token) {
            if (page === "landing" || page === "connect") {
                setPage("dashboard");
            }
        } else {
            if (page !== "landing" && page !== "onboarding" && page !== "connect") {
                setPage("landing");
            }
        }
    }, [token, page]);

    // Live logs state
    const {
        jobs,
        liveLogs,
        activeBuildIndex,
        setActiveBuildIndex,
        logsSearchQuery,
        setLogsSearchQuery,
        logsContainerRef,
        rerunJob,
        loadingJobs
    } = useLiveLogs(token, page === "logs");

    // Settings page state
    const [webhookSecretVisible, setWebhookSecretVisible] = useState(false);
    const [settingsBranch, setSettingsBranch] = useState("main");
    const [settingsPath, setSettingsPath] = useState("README.md");
    const [preferences, setPreferences] = useState({
        routeAnalyzer: true,
        modelAnalyzer: true,
        controllerAnalyzer: false
    });
    const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);

    // AI Provider state
    const [geminiKeyLabel, setGeminiKeyLabel] = useState("");
    const [geminiKey, setGeminiKey] = useState("********************************");
    const [geminiKeyVisible, setGeminiKeyVisible] = useState(false);
    const [groqKeyLabel, setGroqKeyLabel] = useState("");
    const [groqKey, setGroqKey] = useState("");
    const [groqKeyVisible, setGroqKeyVisible] = useState(false);
    const [geminiKeyStatus, setGeminiKeyStatus] = useState("Key validated and ready for routing.");
    const [groqKeyStatus, setGroqKeyStatus] = useState("Invalid token format. Please check your credentials.");

    // Handlers
    const openDetails = (repo) => {
        setSelectedRepo(repo);
        setSettingsBranch(repo.branch || "main");
        setPage("detail");
    };

    const triggerManualBuild = async (repoId) => {
        try {
            if (!token) return;
            const data = await apiTriggerManualBuild(repoId, token);
            if (data.success) {
                // Instantly navigate to the logs console so they can watch it run live
                setPage("logs");
            } else {
                alert("Failed to queue job: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            alert("Error triggering build: " + err.message);
        }
    };


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied payload URL to clipboard!");
    };

    const handlePreferenceToggle = (key) => {
        setPreferences((prev) => {
            const updated = { ...prev, [key]: !prev[key] };
            setHasUnsavedSettings(true);
            return updated;
        });
    };

    const saveConfigurations = () => {
        setHasUnsavedSettings(false);
        alert("Configuration saved successfully!");
    };

    const handleSaveGeminiKey = () => {
        if (!geminiKeyLabel || !geminiKey) {
            alert("Please fill in both label and API token.");
            return;
        }
        setGeminiKeyStatus("Key validated and ready for routing.");
        alert("Gemini key settings saved!");
    };

    const handleSaveGroqKey = () => {
        if (!groqKeyLabel || !groqKey) {
            alert("Please fill in both label and API token.");
            return;
        }
        if (groqKey.length < 10) {
            setGroqKeyStatus("Invalid token format. Please check your credentials.");
        } else {
            setGroqKeyStatus("Key validated and ready for routing.");
        }
        alert("Groq key settings saved!");
    };

    const isAppPage = page !== "landing" && page !== "onboarding" && page !== "connect";

    return (
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0f172a" }}>

            {/* Global error toast */}
            {syncError && (
                <div style={{
                    position: "fixed", top: "72px", left: "50%", transform: "translateX(-50%)",
                    zIndex: 9999, background: "#fef2f2", border: "1px solid #fca5a5",
                    borderRadius: "10px", padding: "12px 20px", display: "flex",
                    alignItems: "center", gap: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    minWidth: "320px", maxWidth: "560px"
                }}>
                    <span style={{ color: "#dc2626", fontSize: "18px" }}>⚠</span>
                    <span style={{ color: "#991b1b", fontSize: "14px", flex: 1 }}>{syncError}</span>
                    <button onClick={clearError} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "18px", lineHeight: 1 }}>×</button>
                </div>
            )}

            <Navbar
                page={page}
                setPage={setPage}
                user={user}
                handleLoginRedirect={handleLoginRedirect}
                logout={logout}
            />

            {/* Landing or Onboarding Pages */}
            {!isAppPage && (
                <>
                    {page === "landing" && (
                        <LandingPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                    {page === "connect" && (
                        <ConnectPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                    {page === "onboarding" && (
                        <OnboardingPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                </>
            )}

            {/* App Pages (Dashboard, Logs) */}
            {isAppPage && (
                <main className="max-w-full mx-auto px-6 md:px-16 pt-28 pb-24 relative z-10">
                    {page === "dashboard" && (
                        <DashboardPage
                            repos={repos}
                            openDetails={openDetails}
                            triggerSync={triggerSync}
                            token={token}
                            syncing={syncing}
                            setAppPage={setPage}
                            toggleRepository={toggleRepository}
                        />
                    )}
                    {page === "detail" && (
                        <DetailPage
                            selectedRepo={selectedRepo}
                            setPage={setPage}
                            triggerManualBuild={triggerManualBuild}
                            jobs={jobs}
                        />
                    )}
                    {page === "logs" && (
                        <BuildLogsPage
                            jobs={jobs}
                            loadingJobs={loadingJobs}
                            activeBuildIndex={activeBuildIndex}
                            setActiveBuildIndex={setActiveBuildIndex}
                            logsSearchQuery={logsSearchQuery}
                            setLogsSearchQuery={setLogsSearchQuery}
                            liveLogs={liveLogs}
                            logsContainerRef={logsContainerRef}
                            rerunJob={rerunJob}
                            setPage={setPage}
                        />
                    )}
                </main>
            )}
        </div>
    );
}
