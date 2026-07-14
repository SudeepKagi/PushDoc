import Job from "../models/job.model.js";
import Repository from "../models/repository.model.js";

export const createJob = async ({
    repository,
    bullJobId,
    commitSha,
    branch,
}) => {

    return await Job.create({
        repository,
        bullJobId,
        commitSha,
        branch,
        startedAt: new Date(),
    });

};

export const updateStatus = async (
    jobId,
    status
) => {

    return await Job.findByIdAndUpdate(
        jobId,
        {
            status,
        },
        {
            returnDocument: "after"
        }
    );

};

export const completeJob = async (
    jobId
) => {

    const job =
        await Job.findById(jobId);

    if (!job) return null;

    job.status = "COMPLETED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    await job.save();

    return job;

};

export const failJob = async (
    jobId,
    error
) => {

    const job =
        await Job.findById(jobId);

    if (!job) return null;

    job.status = "FAILED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    job.error = error;

    await job.save();

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