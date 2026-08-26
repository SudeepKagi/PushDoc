import { isAllowedOrigin } from "../config/cors.config.js";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Browsers automatically attach an HttpOnly cookie to cross-site form submits.
 * Require a configured frontend Origin before accepting cookie-authenticated writes.
 * Bearer-token clients are not vulnerable to browser CSRF and remain supported.
 */
export const requireTrustedOriginForCookieSession = (req, res, next) => {
    if (!UNSAFE_METHODS.has(req.method) || !req.cookies?.auth_token) {
        return next();
    }

    const origin = req.get("Origin");
    if (!isAllowedOrigin(origin)) {
        return res.status(403).json({
            success: false,
            message: "Cross-site request blocked",
        });
    }

    return next();
};
