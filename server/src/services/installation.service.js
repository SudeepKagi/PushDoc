import Installation from "../models/installation.model.js";

export const createOrUpdateInstallation = async (
    installationData,
    userId
) => {

    const installation = await Installation.findOneAndUpdate(
        {
            installationId: installationData.id,
        },
        {
            installationId: installationData.id,
            user: userId,
            accountLogin: installationData.account.login,
            accountType: installationData.account.type,
        },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
        }
    );

    return installation;
};