import Job from "../models/job.model.js";
import Repository from "../models/repository.model.js";
import eventsService from "./events.service.js";

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