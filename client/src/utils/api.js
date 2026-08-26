import { BACKEND_URL } from "../constants/config";

export const getLoginUrl = () => {
    return `${BACKEND_URL}/auth/github/login`;
};

export const fetchCurrentUser = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            credentials: "include",
        });
        if (!res.ok) return { success: false, status: res.status };
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const logoutUser = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
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

export const syncRepositories = async () => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/sync`, {
        credentials: "include",
    });
    const data = await res.json();
    return data;
};

export const fetchJobs = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs`, {
            credentials: "include",
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

export const fetchJobLogs = async (jobId) => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs/${jobId}/logs`, {
            credentials: "include",
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

export const fetchRepoReadme = async (repoId) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/readme`, {
        credentials: "include",
    });
    const data = await res.json();
    return data;
};

export const triggerManualBuild = async (repoId) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/trigger`, {
        method: "POST",
        credentials: "include",
    });
    const data = await res.json();
    return data;
};

export const toggleRepositoryActive = async (repoId) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/toggle`, {
        method: "PATCH",
        credentials: "include",
    });
    const data = await res.json();
    return data;
};

export const cancelJob = async (jobId) => {
    try {
        const res = await fetch(`${BACKEND_URL}/github/jobs/${jobId}/cancel`, {
            method: "POST",
            credentials: "include",
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: err.message };
    }
};
