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
        },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
        }
    );

    return repository;
};