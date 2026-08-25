import { EventEmitter } from "events";

class EventsService extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(200);
        // Map of userId string -> Set of active Express Response streams
        this.clients = new Map();
        // Map of bullJobId -> userId string to route log lines securely to the owner
        this.jobOwners = new Map();
    }

    /**
     * Register a new client SSE stream for a given user
     */
    addClient(userId, res) {
        if (!userId) return;
        const uid = userId.toString();
        if (!this.clients.has(uid)) {
            this.clients.set(uid, new Set());
        }
        this.clients.get(uid).add(res);
    }

    /**
     * Remove client SSE stream on disconnect
     */
    removeClient(userId, res) {
        if (!userId) return;
        const uid = userId.toString();
        if (this.clients.has(uid)) {
            const set = this.clients.get(uid);
            set.delete(res);
            if (set.size === 0) {
                this.clients.delete(uid);
            }
        }
    }

    /**
     * Send an event specifically to all active connections for a given user
     */
    sendToUser(userId, eventName, data) {
        if (!userId) return;
        const uid = userId.toString();
        const clientSet = this.clients.get(uid);
        if (!clientSet || clientSet.size === 0) return;

        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of Array.from(clientSet)) {
            try {
                res.write(payload);
            } catch {
                clientSet.delete(res);
            }
        }
    }

    /**
     * Broadcast an event to all connected dashboard sessions
     */
    broadcast(eventName, data) {
        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const [uid, clientSet] of this.clients.entries()) {
            for (const res of Array.from(clientSet)) {
                try {
                    res.write(payload);
                } catch (err) {
                    clientSet.delete(res);
                }
            }
        }
    }

    broadcastJobUpdate(userId, job) {
        const ownerId = userId || job?.repository?.installation?.user?.toString() || job?.repository?.installation?.user?._id?.toString();
        if (job?.bullJobId && ownerId) {
            this.jobOwners.set(job.bullJobId, ownerId);
        }

        if (ownerId) {
            this.sendToUser(ownerId, "job_update", job);
        }

        if (job?.bullJobId && ["COMPLETED", "FAILED", "CANCELLED"].includes(job?.status)) {
            setTimeout(() => this.jobOwners.delete(job.bullJobId), 15_000).unref?.();
        }
    }

    /**
     * Stream a real-time log line to open terminals for the job owner
     */
    broadcastLog(bullJobId, logLine) {
        const ownerId = this.jobOwners.get(bullJobId);
        if (!ownerId) return;
        this.sendToUser(ownerId, "job_log", { bullJobId, logLine });
    }
}

const eventsService = new EventsService();
export default eventsService;
