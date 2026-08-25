import Job from "../models/job.model.js";
import Repository from "../models/repository.model.js";
import eventsService from "./events.service.js";
import readmeQueue from "../queue/queue.js";

export const createJob = async ({
    repository,
    bullJobId,
    commitSha,
    branch,
    status = "QUEUED",
}) => {
    const job = await Job.create({
        repository,
        bullJobId,
        commitSha,
        branch,
        status,
        startedAt: new Date(),
    });

    const populatedJob = await Job.findById(job._id).populate("repository");
    eventsService.broadcastJobUpdate(null, populatedJob);

    return populatedJob;
};

export const updateStatus = async (
    jobId,
    status
) => {
    const job = await Job.findByIdAndUpdate(
        jobId,
        {
            status,
        },
        {
            returnDocument: "after"
        }
    ).populate("repository");

    if (job) {
        eventsService.broadcastJobUpdate(null, job);
    }

    return job;
};

export const completeJob = async (
    jobId,
    {
        originalReadme,
        generatedReadme,
        validationScore,
        validationWarnings,
    } = {}
) => {
    const job = await Job.findById(jobId).populate("repository");

    if (!job) return null;

    job.status = "COMPLETED";
    job.completedAt = new Date();
    job.duration = job.completedAt - job.startedAt;

    if (originalReadme !== undefined) job.originalReadme = originalReadme;
    if (generatedReadme !== undefined) job.generatedReadme = generatedReadme;
    if (validationScore !== undefined) job.validationScore = validationScore;
    if (validationWarnings !== undefined) job.validationWarnings = validationWarnings;

    await job.save();

    eventsService.broadcastJobUpdate(null, job);

    return job;
};

export const failJob = async (
    jobId,
    error,
    {
        originalReadme,
        generatedReadme,
        validationScore,
        validationWarnings,
    } = {}
) => {
    const job = await Job.findById(jobId).populate("repository");

    if (!job) return null;

    job.status = "FAILED";
    job.completedAt = new Date();
    job.duration = job.completedAt - job.startedAt;
    job.error = error;

    if (originalReadme !== undefined) job.originalReadme = originalReadme;
    if (generatedReadme !== undefined) job.generatedReadme = generatedReadme;
    if (validationScore !== undefined) job.validationScore = validationScore;
    if (validationWarnings !== undefined) job.validationWarnings = validationWarnings;

    await job.save();

    eventsService.broadcastJobUpdate(null, job);

    return job;
};

export const getJobsByInstallation = async (installationId) => {

    const repos = await Repository.find({ installation: installationId }).select("_id");
    const repoIds = repos.map(r => r._id);

    return await Job.find({ repository: { $in: repoIds } })
        .populate("repository")
        .sort({ createdAt: -1 })
        .limit(50);

};

export const getJobById = async (jobId) => {
    return await Job.findById(jobId).populate("repository");
};

export const getJobCountForRepository = async (repoId) => {
    return await Job.countDocuments({ repository: repoId });
};

export const cancelJob = async (jobId, reason = "Synthesis stopped by user.") => {
    const job = await failJob(jobId, reason);
    if (job?.bullJobId) {
        try {
            const bullJob = await readmeQueue.getJob(job.bullJobId);
            if (bullJob) {
                const state = await bullJob.getState();
                if (state === "waiting" || state === "delayed") {
                    await bullJob.remove();
                }
            }
        } catch {
            // Best-effort queue cleanup
        }
    }
    return job;
};

export const reapStaleJobs = async () => {
    try {
        const twoMinutesAgo = new Date(Date.now() - 120_000);
        const tenMinutesAgo = new Date(Date.now() - 600_000);

        const staleQueued = await Job.find({
            status: "QUEUED",
            createdAt: { $lt: twoMinutesAgo },
        }).populate("repository");

        for (const job of staleQueued) {
            await failJob(job._id, "Synthesis timed out: Worker did not pick up the job within 2 minutes. Please retry.");
        }

        const staleInProgress = await Job.find({
            status: { $in: ["CLONING", "READING", "GENERATING", "WRITING", "COMMITTING", "PUSHING"] },
            updatedAt: { $lt: tenMinutesAgo },
        }).populate("repository");

        for (const job of staleInProgress) {
            await failJob(job._id, "Synthesis execution timed out after 10 minutes.");
        }
    } catch {
        // Silently continue reaper loop
    }
};