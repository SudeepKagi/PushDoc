/**
 * Cross-surface URLs.
 *
 * The marketing/landing site lives on the apex domain (pushdoc.online, served
 * by `seo-client`); this app is the dashboard on app.pushdoc.online. Anything
 * that sends a user "back to the site" must be a real cross-origin link — a
 * react-router navigate() would just keep them on the app domain.
 */
export const MARKETING_URL =
  import.meta.env.VITE_MARKETING_URL ?? "https://pushdoc.online";

/**
 * Production origin of this app. Deliberately not env-overridable: it backs
 * canonical URLs, which must always point at production no matter where the
 * build runs.
 */
export const APP_ORIGIN = "https://app.pushdoc.online";
