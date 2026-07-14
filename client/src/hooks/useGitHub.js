import { useState, useEffect, useCallback } from "react";
import { exchangeOAuthCode as apiExchangeCode, syncRepositories as apiSyncRepos, getLoginUrl, toggleRepositoryActive as apiToggleRepoActive } from "../utils/api";


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
        return localStorage.getItem("token") || null;
    });

    const clearError = () => setError(null);

    const handleAuthError = useCallback((err) => {
        // If the server responds with 401 the JWT has expired — log out
        if (err?.status === 401 || err?.message?.includes("401")) {
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
                setToken(data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
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
            const activeToken = authToken || token;
            if (!activeToken) return;
            const data = await apiSyncRepos(activeToken);
            if (data.success && data.repositories) {
                // Use data as-is — no hardcoded fallbacks
                setRepos(data.repositories);
                if (data.repositories.length > 0 && !selectedRepo) {
                    setSelectedRepo(data.repositories[0]);
                }
            } else if (!data.success) {
                setError(data.message || "Repository sync failed.");
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

    const logout = () => {
        setUser(null);
        setToken(null);
        setRepos([]);
        setSelectedRepo(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // Look for GitHub OAuth Callback Code or Token in URL query parameters
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
            // Clean URL query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && !authCode) {
            setAuthCode(code);
            exchangeOAuthCode(code);
            // Clean URL query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (token && repos.length === 0) {
            // Auto sync if token exists
            triggerSync(token);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleRepository = async (repoId) => {
        if (!token) return;
        setError(null);
        try {
            const data = await apiToggleRepoActive(repoId, token);
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
