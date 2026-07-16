import { useState, useEffect, useRef } from "react";
import { fetchJobs, fetchJobLogs } from "../utils/api";

export default function useLiveLogs(token, isActive) {
    const [jobs, setJobs] = useState([]);
    const [activeBuildIndex, setActiveBuildIndex] = useState(0);
    const [logsSearchQuery, setLogsSearchQuery] = useState("");
    const [liveLogs, setLiveLogs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const logsContainerRef = useRef(null);

    // Fetch Jobs List
    const loadJobsList = async () => {
        if (!token) return;
        setLoadingJobs(true);
        try {
            const data = await fetchJobs(token);
            if (data.success) {
                setJobs(data.jobs || []);
            }
        } catch (err) {
            console.warn("Failed to load jobs list:", err.message);
        } finally {
            setLoadingJobs(false);
        }
    };

    // Load jobs when active
    useEffect(() => {
        if (isActive) {
            loadJobsList();
        }
    }, [isActive, token]);

    // Poll jobs list if any job is currently in progress
    useEffect(() => {
        if (!isActive || !token || jobs.length === 0) return;

        const hasInProgress = jobs.some(job =>
            ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(job.status)
        );

        if (!hasInProgress) return;

        const interval = setInterval(() => {
            loadJobsList();
        }, 3000);

        return () => clearInterval(interval);
    }, [isActive, token, jobs]);

    // Fetch Logs for the active job
    useEffect(() => {
        if (!isActive || !token || jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (!activeJob) return;

        let isMounted = true;
        const loadLogs = async () => {
            try {
                const data = await fetchJobLogs(activeJob._id, token);
                if (data.success && isMounted) {
                    setLiveLogs(data.logs || []);
                }
            } catch (err) {
                console.warn("Failed to load job logs:", err.message);
            }
        };

        loadLogs();

        // If the job is in progress, poll for updates
        let interval;
        const inProgress = ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(activeJob.status);
        if (inProgress) {
            interval = setInterval(() => {
                loadLogs();
            }, 3000);
        }

        return () => {
            isMounted = false;
            if (interval) clearInterval(interval);
        };
    }, [isActive, token, jobs, activeBuildIndex]);

    // Auto-scroll logs terminal
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [liveLogs]);

    const rerunJob = async () => {
        if (jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (!activeJob) return;

        alert(`Re-running build execution for ${activeJob.repository?.name || "repository"}...`);
        // Refresh the list after a delay
        setTimeout(() => {
            loadJobsList();
        }, 1500);
    };

    return {
        jobs,
        liveLogs,
        setLiveLogs,
        activeBuildIndex,
        setActiveBuildIndex,
        logsSearchQuery,
        setLogsSearchQuery,
        logsContainerRef,
        rerunJob,
        loadingJobs,
        refreshJobs: loadJobsList
    };
}
