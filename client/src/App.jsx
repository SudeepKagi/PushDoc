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
        loadingJobs,
        refreshJobs
    } = useLiveLogs(token, page === "logs" || page === "detail");

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
                await refreshJobs();
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
        <div className="min-h-screen bg-bg text-text-primary font-sans">
            {/* Global error banner */}
            {syncError && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-danger/15 text-danger border border-danger/30 rounded-[6px] px-4 py-2 flex items-center gap-3 text-xs font-mono shadow-md min-w-[320px] max-w-lg">
                    <span className="font-semibold">!</span>
                    <span className="flex-1">{syncError}</span>
                    <button onClick={clearError} className="text-danger hover:opacity-80 font-bold ml-2">×</button>
                </div>
            )}

            <Navbar
                page={page}
                setPage={setPage}
                user={user}
                handleLoginRedirect={handleLoginRedirect}
                logout={logout}
            />

            {/* Landing, Connect & Onboarding Pages */}
            {!isAppPage && (
                <main className="pt-14">
                    {page === "landing" && (
                        <LandingPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                    {page === "connect" && (
                        <ConnectPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                    {page === "onboarding" && (
                        <OnboardingPage handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
                    )}
                </main>
            )}

            {/* Authenticated App Pages */}
            {isAppPage && (
                <div className="flex pt-14 min-h-[calc(100vh-3.5rem)]">
                    <Sidebar page={page} setPage={setPage} />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
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
                        {page === "settings" && (
                            <SettingsPage
                                selectedRepo={selectedRepo}
                                repos={repos}
                                openDetails={openDetails}
                                webhookSecretVisible={webhookSecretVisible}
                                setWebhookSecretVisible={setWebhookSecretVisible}
                                settingsBranch={settingsBranch}
                                setSettingsBranch={setSettingsBranch}
                                settingsPath={settingsPath}
                                setSettingsPath={setSettingsPath}
                                preferences={preferences}
                                setPreferences={setPreferences}
                                hasUnsavedSettings={hasUnsavedSettings}
                                setHasUnsavedSettings={setHasUnsavedSettings}
                                handlePreferenceToggle={handlePreferenceToggle}
                                saveConfigurations={saveConfigurations}
                                copyToClipboard={copyToClipboard}
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
                        {page === "ai-provider" && (
                            <AIProviderPage
                                geminiKeyLabel={geminiKeyLabel}
                                setGeminiKeyLabel={setGeminiKeyLabel}
                                geminiKey={geminiKey}
                                setGeminiKey={setGeminiKey}
                                geminiKeyVisible={geminiKeyVisible}
                                setGeminiKeyVisible={setGeminiKeyVisible}
                                groqKeyLabel={groqKeyLabel}
                                setGroqKeyLabel={setGroqKeyLabel}
                                groqKey={groqKey}
                                setGroqKey={setGroqKey}
                                groqKeyVisible={groqKeyVisible}
                                setGroqKeyVisible={setGroqKeyVisible}
                                geminiKeyStatus={geminiKeyStatus}
                                groqKeyStatus={groqKeyStatus}
                                handleSaveGeminiKey={handleSaveGeminiKey}
                                handleSaveGroqKey={handleSaveGroqKey}
                            />
                        )}
                    </main>
                </div>
            )}
        </div>
    );
}
