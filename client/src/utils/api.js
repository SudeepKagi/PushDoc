import { BACKEND_URL } from "../constants/config";

export const getLoginUrl = () => {
    return `${BACKEND_URL}/auth/github/login`;
};

const getAuthHeaders = (explicitToken, extraHeaders = {}) => {
    const token = explicitToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    const headers = { ...extraHeaders };
    if (token && token !== "cookie_authenticated") {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const fetchCurrentUser = async (token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            credentials: "include",
            headers: getAuthHeaders(token),
        });
        if (!res.ok) return { success: false, status: res.status };
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const logoutUser = async (token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: getAuthHeaders(token),
        });
        return await res.json();
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const exchangeOAuthCode = async (code) => {
    const res = await fetch(`${BACKEND_URL}/auth/github/callback?code=${code}`, {
        credentials: "include",
    });
    const data = await res.json();
    return data;
};

export const syncRepositories = async (token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/sync`, {
        credentials: "include",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    return data;
};

export const fetchJobs = async (token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs`, {
            credentials: "include",
            headers: getAuthHeaders(token),
        });
        if (!res.ok) {
            return { success: false, status: res.status };
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const fetchJobLogs = async (jobId, token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs/${jobId}/logs`, {
            credentials: "include",
            headers: getAuthHeaders(token),
        });
        if (!res.ok) {
            return { success: false, status: res.status };
        }
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const fetchRepoReadme = async (repoId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/readme`, {
        credentials: "include",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    return data;
};

export const triggerManualBuild = async (repoId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/trigger`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    return data;
};

export const toggleRepositoryActive = async (repoId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/toggle`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    return data;
};

export const cancelJob = async (jobId, token) => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs/${jobId}/cancel`, {
            method: "POST",
            credentials: "include",
            headers: getAuthHeaders(token),
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};
