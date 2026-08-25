import { useState, useEffect, useRef, useCallback } from "react";
import { fetchJobs, fetchJobLogs } from "../utils/api";

export default function useLiveLogs(token, isActive) {
    const [jobs, setJobs] = useState([]);
    const [activeBuildIndex, setActiveBuildIndex] = useState(0);
    const [logsSearchQuery, setLogsSearchQuery] = useState("");
    const [liveLogs, setLiveLogs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const logsContainerRef = useRef(null);

    const isFetchingJobsRef = useRef(false);
    const isFetchingLogsRef = useRef(false);
    const isRateLimitedRef = useRef(false);
    const jobsRef = useRef([]);

    // Keep jobsRef in sync with state
    useEffect(() => {
        jobsRef.current = jobs;
    }, [jobs]);

    // Fetch Jobs List safely
    const loadJobsList = useCallback(async () => {
        if (!token || isFetchingJobsRef.current || isRateLimitedRef.current) return;
        isFetchingJobsRef.current = true;
        setLoadingJobs(true);

        try {
            const data = await fetchJobs(token);
            if (data && data.success) {
                setJobs(data.jobs || []);
                isRateLimitedRef.current = false;
            } else if (data && data.status === 429) {
                isRateLimitedRef.current = true;
                setTimeout(() => { isRateLimitedRef.current = false; }, 10000);
            }
        } catch (err) {
            if (err?.message?.includes("429")) {
                isRateLimitedRef.current = true;
                setTimeout(() => { isRateLimitedRef.current = false; }, 10000);
            }
            console.warn("Failed to load jobs list:", err.message);
        } finally {
            isFetchingJobsRef.current = false;
            setLoadingJobs(false);
        }
    }, [token]);

    // Load initial jobs when active
    useEffect(() => {
        if (isActive && token) {
            loadJobsList();
        }
    }, [isActive, token, loadJobsList]);

    // Poll jobs list if any job is currently in progress
    useEffect(() => {
        if (!isActive || !token) return;

        const interval = setInterval(() => {
            const currentJobs = jobsRef.current || [];
            const hasInProgress = currentJobs.some(job =>
                ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(job.status)
            );

            if (hasInProgress) {
                loadJobsList();
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isActive, token, loadJobsList]);

    // Fetch Logs for the active job
    const loadLogs = useCallback(async (jobId) => {
        if (!token || !jobId || isFetchingLogsRef.current || isRateLimitedRef.current) return;
        isFetchingLogsRef.current = true;

        try {
            const data = await fetchJobLogs(jobId, token);
            if (data && data.success) {
                setLiveLogs(data.logs || []);
            }
        } catch (err) {
            console.warn("Failed to load job logs:", err.message);
        } finally {
            isFetchingLogsRef.current = false;
        }
    }, [token]);

    // Load logs on activeBuildIndex change
    useEffect(() => {
        if (!isActive || !token || jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (activeJob?._id) {
            loadLogs(activeJob._id);
        }
    }, [isActive, token, activeBuildIndex, jobs.length, loadLogs]);

    // Poll logs only while the active job is executing
    useEffect(() => {
        if (!isActive || !token || jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (!activeJob) return;

        const inProgress = ["QUEUED", "CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"].includes(activeJob.status);
        if (!inProgress) return;

        const interval = setInterval(() => {
            loadLogs(activeJob._id);
        }, 4000);

        return () => clearInterval(interval);
    }, [isActive, token, activeBuildIndex, jobs, loadLogs]);

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
