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
    jobId,
    {
        originalReadme,
        generatedReadme,
        validationScore,
        validationWarnings,
    } = {}
) => {

    const job =
        await Job.findById(jobId);

    if (!job) return null;

    job.status = "COMPLETED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    if (originalReadme !== undefined) job.originalReadme = originalReadme;
    if (generatedReadme !== undefined) job.generatedReadme = generatedReadme;
    if (validationScore !== undefined) job.validationScore = validationScore;
    if (validationWarnings !== undefined) job.validationWarnings = validationWarnings;

    await job.save();

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

    const job =
        await Job.findById(jobId);

    if (!job) return null;

    job.status = "FAILED";

    job.completedAt = new Date();

    job.duration =
        job.completedAt - job.startedAt;

    job.error = error;

    if (originalReadme !== undefined) job.originalReadme = originalReadme;
    if (generatedReadme !== undefined) job.generatedReadme = generatedReadme;
    if (validationScore !== undefined) job.validationScore = validationScore;
    if (validationWarnings !== undefined) job.validationWarnings = validationWarnings;

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