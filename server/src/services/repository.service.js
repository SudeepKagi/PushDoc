import Repository from "../models/repository.model.js";

export const createOrUpdateRepository = async (
    githubRepo,
    installationId
) => {

    const repository = await Repository.findOneAndUpdate(
        {
            githubId: githubRepo.id,
        },
        {
            githubId: githubRepo.id,
            installation: installationId,
            name: githubRepo.name,
            fullName: githubRepo.full_name,
            owner: githubRepo.owner.login,
            private: githubRepo.private,
            cloneUrl: githubRepo.clone_url,
        },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
        }
    );

    return repository;
};

export const getRepositoryByGithubId = async (
    githubRepositoryId
) => {

    return await Repository.findOne({
        githubId: githubRepositoryId,
    }).populate("installation");

};

export const deleteRepositoryByGithubId = async (
    githubRepositoryId
) => {

    return await Repository.deleteOne({
        githubId: githubRepositoryId,
    });

};