export const INSTALLATION_STATE_EXPIRY_MS =
    (Number(process.env.INSTALLATION_STATE_EXPIRY_MINUTES) || 5)
    * 60
    * 1000;