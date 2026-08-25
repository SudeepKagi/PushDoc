import { EventEmitter } from "events";
import * as logger from "./logger.service.js";

class EventsService extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(200);
        // Map of userId string -> Set of active Express Response streams
        this.clients = new Map();
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
        logger.debug(`[SSE] Client connected for user ${uid}. Total clients: ${this.clients.get(uid).size}`);
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
            logger.debug(`[SSE] Client disconnected for user ${uid}`);
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
            } catch (err) {
                logger.warn(`[SSE] Error writing to client for user ${uid}: ${err.message}`);
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

    /**
     * Broadcast a job state transition (QUEUED, CLONING, GENERATING, COMPLETED, etc.)
     */
    broadcastJobUpdate(userId, job) {
        if (userId) {
            this.sendToUser(userId, "job_update", job);
        }
        // Also broadcast so any active dashboard tab tracks the update
        this.broadcast("job_update", job);
    }

    /**
     * Stream a real-time log line to open terminals
     */
    broadcastLog(bullJobId, logLine) {
        this.broadcast("job_log", { bullJobId, logLine });
    }
}

const eventsService = new EventsService();
export default eventsService;
