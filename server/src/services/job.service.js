import Job from "../models/job.model.js";

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