import { useState, useEffect, useRef, useCallback } from "react";
import { fetchJobs, fetchJobLogs } from "../utils/api";
import { BACKEND_URL } from "../constants/config";

export default function useLiveLogs(token, isActive, onAuthError) {
    const [jobs, setJobs] = useState([]);
    const [activeBuildIndex, setActiveBuildIndex] = useState(0);
    const [logsSearchQuery, setLogsSearchQuery] = useState("");
    const [liveLogs, setLiveLogs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const logsContainerRef = useRef(null);
    const activeJobRef = useRef(null);

    // Initial Hydration
    const loadJobsList = useCallback(async () => {
        setLoadingJobs(true);
        try {
            const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
            const data = await fetchJobs(activeToken);
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
        if (isActive) {
            loadJobsList();
        }
    }, [isActive, token, loadJobsList]);

    // Track active job in a ref for real-time SSE log filtering
    useEffect(() => {
        activeJobRef.current = jobs[activeBuildIndex] || null;
    }, [jobs, activeBuildIndex]);

    // Fetch initial historical logs when active build changes
    useEffect(() => {
        if (!isActive || jobs.length === 0) return;
        const activeJob = jobs[activeBuildIndex];
        if (!activeJob?._id) return;

        let isMounted = true;
        const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        fetchJobLogs(activeJob._id, activeToken)
            .then(data => {
                if (isMounted && data && data.success) {
                    const fetched = data.logs || [];
                    setLiveLogs(prev => {
                        if (prev.length === 0) return fetched;
                        const existing = new Set(prev);
                        const newEntries = fetched.filter(l => !existing.has(l));
                        return [...prev, ...newEntries];
                    });
                }
            })
            .catch(err => console.warn("Failed to fetch historical logs:", err.message));

        return () => {
            isMounted = false;
        };
    }, [isActive, activeBuildIndex, jobs.length, token]);

    // Real-Time Server-Sent Events (SSE) stream via Secure HttpOnly Cookie + Fallback Query Token
    useEffect(() => {
        if (!isActive) return;

        const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const sseUrl = activeToken && activeToken !== "cookie_authenticated"
            ? `${BACKEND_URL}/github/events/stream?token=${encodeURIComponent(activeToken)}`
            : `${BACKEND_URL}/github/events/stream`;

        let eventSource = null;
        let consecutiveFailures = 0;
        let lastFailureAt = 0;

        try {
            // Automatically sends HttpOnly auth_token cookie with SSE request if supported
            eventSource = new EventSource(sseUrl, { withCredentials: true });

            eventSource.addEventListener("connected", () => {
                consecutiveFailures = 0;
            });

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
                const now = Date.now();
                consecutiveFailures = (now - lastFailureAt < 2500) ? consecutiveFailures + 1 : 1;
                lastFailureAt = now;

                if (consecutiveFailures >= 3) {
                    eventSource.close();
                    onAuthError?.();
                }
            };
        } catch (err) {
            console.warn("Failed to initialize SSE EventSource:", err.message);
        }

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [isActive, onAuthError]);

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
