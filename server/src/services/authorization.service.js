const asId = (value) => value?._id?.toString?.() || value?.toString?.();

/**
 * Checks that a populated Job or Repository belongs to the requesting
 * installation. Keeping this check central prevents a route from relying on
 * authentication alone when it accepts an attacker-controlled resource ID.
 */
export const belongsToInstallation = (resource, installation) => {
    const resourceInstallationId = asId(resource?.installation);
    const requesterInstallationId = asId(installation);

    return Boolean(resourceInstallationId && requesterInstallationId
        && resourceInstallationId === requesterInstallationId);
};
