import { useState, useEffect, useCallback } from "react";
import {
    exchangeOAuthCode as apiExchangeCode,
    syncRepositories as apiSyncRepos,
    getLoginUrl,
    toggleRepositoryActive as apiToggleRepoActive,
    fetchCurrentUser,
    logoutUser
} from "../utils/api";

export default function useGitHub() {
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [authCode, setAuthCode] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || (localStorage.getItem("user") ? "cookie_authenticated" : null);
    });

    const clearError = () => setError(null);

    const handleAuthError = useCallback((err) => {
        // If the server responds with 401 the session has expired — log out
        if (err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Authentication required")) {
            logout();
        } else {
            setError(err?.message || "An unexpected error occurred");
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const exchangeOAuthCode = async (code) => {
        setSyncing(true);
        setError(null);
        try {
            const data = await apiExchangeCode(code);
            if (data.success) {
                setUser(data.user);
                if (data.token) {
                    setToken(data.token);
                    localStorage.setItem("token", data.token);
                }
                localStorage.setItem("user", JSON.stringify(data.user));
                await triggerSync(data.token);
            } else {
                setError(data.message || "GitHub login failed. Please try again.");
            }
        } catch (err) {
            handleAuthError(err);
        } finally {
            setSyncing(false);
        }
    };

    const triggerSync = async (authToken) => {
        setSyncing(true);
        setError(null);
        try {
            const activeToken = authToken || token || localStorage.getItem("token");
            const data = await apiSyncRepos(activeToken);
            if (data.success && data.repositories) {
                setRepos(data.repositories);
                if (data.repositories.length > 0 && !selectedRepo) {
                    setSelectedRepo(data.repositories[0]);
                }
            } else if (!data.success) {
                if (data.status === 401 || data.message?.includes("Authentication required")) {
                    handleAuthError(data);
                } else {
                    setError(data.message || "Repository sync failed.");
                }
            }
        } catch (err) {
            handleAuthError(err);
        } finally {
            setSyncing(false);
        }
    };

    const handleLoginRedirect = () => {
        window.location.href = getLoginUrl();
    };

    const logout = async () => {
        const activeToken = token || localStorage.getItem("token");
        await logoutUser(activeToken);
        setUser(null);
        setToken(null);
        setRepos([]);
        setSelectedRepo(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // Verify session on boot and check for OAuth callback params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const urlUsername = params.get("username");
        const urlAvatar = params.get("avatarUrl");
        const code = params.get("code");

        if (urlToken) {
            const parsedUser = { username: urlUsername, avatarUrl: urlAvatar };
            setUser(parsedUser);
            setToken(urlToken);
            localStorage.setItem("user", JSON.stringify(parsedUser));
            localStorage.setItem("token", urlToken);
            triggerSync(urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && !authCode) {
            setAuthCode(code);
            exchangeOAuthCode(code);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlUsername) {
            const parsedUser = { username: urlUsername, avatarUrl: urlAvatar };
            setUser(parsedUser);
            localStorage.setItem("user", JSON.stringify(parsedUser));
            triggerSync();
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Check active session with /auth/me
            const savedToken = localStorage.getItem("token");
            fetchCurrentUser(savedToken).then(data => {
                if (data.success && data.user) {
                    setUser(data.user);
                    if (savedToken) setToken(savedToken);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    triggerSync(savedToken);
                } else if (data.status === 401) {
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                }
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleRepository = async (repoId) => {
        setError(null);
        try {
            const activeToken = token || localStorage.getItem("token");
            const data = await apiToggleRepoActive(repoId, activeToken);
            if (data.success && data.repository) {
                setRepos(prev => prev.map(r => r._id === repoId ? data.repository : r));
                setSelectedRepo(prev => prev && prev._id === repoId ? data.repository : prev);

                if (data.jobQueued) {
                    alert("AI updates enabled! First-time auto-verification has been queued.");
                }
            } else {
                setError(data.message || "Failed to toggle repository active status.");
            }
        } catch (err) {
            handleAuthError(err);
        }
    };

    return {
        repos,
        setRepos,
        selectedRepo,
        setSelectedRepo,
        syncing,
        user,
        token,
        error,
        clearError,
        triggerSync,
        handleLoginRedirect,
        logout,
        toggleRepository
    };
}
