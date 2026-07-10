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
    bullJobId,
    status
) => {

    return await Job.findOneAndUpdate(
        {
            bullJobId,
        },
        {
            status,
        },
        {
            new: true,
        }
    );

};

export const completeJob = async (
    bullJobId
) => {

    const job =
        await Job.findOne({
            bullJobId,
        });

    if (!job) return null;

    job.status = "COMPLETED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    await job.save();

    return job;

};

export const failJob = async (
    bullJobId,
    error
) => {

    const job =
        await Job.findOne({
            bullJobId,
        });

    if (!job) return null;

    job.status = "FAILED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    job.error = error;

    await job.save();

    return job;

};