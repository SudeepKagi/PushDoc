import { useState, useEffect, useRef, useCallback } from "react";
import { fetchJobs, fetchJobLogs } from "../utils/api";
import { BACKEND_URL } from "../constants/config";

export default function useLiveLogs(token, isActive) {
    const [jobs, setJobs] = useState([]);
    const [activeBuildIndex, setActiveBuildIndex] = useState(0);
    const [logsSearchQuery, setLogsSearchQuery] = useState("");
    const [liveLogs, setLiveLogs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const logsContainerRef = useRef(null);
    const activeJobRef = useRef(null);

    // Initial Hydration
    const loadJobsList = useCallback(async () => {
        if (!token) return;
        setLoadingJobs(true);
        try {
            const data = await fetchJobs(token);
            if (data && data.success) {
                setJobs(data.jobs || []);
            }
        } catch (err) {
            console.warn("Failed to load initial jobs list:", err.message);
        } finally {
            setLoadingJobs(false);
        }
    }, [token]);

    // Load initial jobs when active
    useEffect(() => {
        if (isActive && token) {
            loadJobsList();
        }
    }, [isActive, token, loadJobsList]);

    // Track active job in a ref for real-time SSE log filtering
    useEffect(() => {
        activeJobRef.current = jobs[activeBuildIndex] || null;
    }, [jobs, activeBuildIndex]);

    // Fetch initial historical logs when active build changes
    useEffect(() => {
        if (!isActive || !token || jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (!activeJob?._id) return;

        let isMounted = true;
        fetchJobLogs(activeJob._id, token)
            .then(data => {
                if (isMounted && data && data.success) {
                    setLiveLogs(data.logs || []);
                }
            })
            .catch(err => console.warn("Failed to fetch historical logs:", err.message));

        return () => {
            isMounted = false;
        };
    }, [isActive, token, activeBuildIndex, jobs.length]);

    // Real-Time Server-Sent Events (SSE) stream (0 polling)
    useEffect(() => {
        if (!isActive || !token) return;

        const sseUrl = `${BACKEND_URL}/github/events/stream?token=${encodeURIComponent(token)}`;
        let eventSource = null;

        try {
            eventSource = new EventSource(sseUrl);

            // Job Status Transition Event (QUEUED -> CLONING -> GENERATING -> COMPLETED, etc.)
            eventSource.addEventListener("job_update", (e) => {
                try {
                    const updatedJob = JSON.parse(e.data);
                    if (!updatedJob?._id) return;

                    setJobs(prevJobs => {
                        const existingIdx = prevJobs.findIndex(j => j._id === updatedJob._id);
                        if (existingIdx !== -1) {
                            const newJobs = [...prevJobs];
                            newJobs[existingIdx] = { ...newJobs[existingIdx], ...updatedJob };
                            return newJobs;
                        }
                        return [updatedJob, ...prevJobs];
                    });
                } catch (err) {
                    console.warn("Failed to parse SSE job_update event:", err.message);
                }
            });

            // Live Log Stream Event (Terminal logs in real time)
            eventSource.addEventListener("job_log", (e) => {
                try {
                    const { bullJobId, logLine } = JSON.parse(e.data);
                    const currentActive = activeJobRef.current;
                    if (currentActive && (currentActive.bullJobId === bullJobId || currentActive._id === bullJobId)) {
                        setLiveLogs(prev => [...prev, logLine]);
                    }
                } catch (err) {
                    console.warn("Failed to parse SSE job_log event:", err.message);
                }
            });

            eventSource.onerror = () => {
                // EventSource will automatically retry connection
            };
        } catch (err) {
            console.warn("Failed to initialize SSE EventSource:", err.message);
        }

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [isActive, token]);

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
