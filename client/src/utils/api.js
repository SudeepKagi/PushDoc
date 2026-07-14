import { BACKEND_URL } from "../constants/config";

export const getLoginUrl = () => {
    return `${BACKEND_URL}/auth/github/login`;
};

export const exchangeOAuthCode = async (code) => {
    const res = await fetch(`${BACKEND_URL}/auth/github/callback?code=${code}`);
    const data = await res.json();
    return data;
};

export const syncRepositories = async (token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/sync`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    return data;
};

export const fetchJobs = async (token) => {
    const res = await fetch(`${BACKEND_URL}/github/jobs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    return data;
};

export const fetchJobLogs = async (jobId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/jobs/${jobId}/logs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    return data;
};

export const triggerManualBuild = async (repoId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/trigger`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    return data;
};

export const toggleRepositoryActive = async (repoId, token) => {
    const res = await fetch(`${BACKEND_URL}/github/repositories/${repoId}/toggle`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    return data;
};

