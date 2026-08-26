import * as jwtService from "../services/jwt.service.js";

const authMiddleware = (req, res, next) => {
    try {
        let token = null;

        // 1. Primary & Secure: HttpOnly Cookie
        if (req.cookies && req.cookies.auth_token) {
            token = req.cookies.auth_token;
        // 2. Standard API Header: Authorization: Bearer <token> (Cross-origin SPA, Postman, cURL, Mobile, CLI)
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        // 3. Query param token: for browser EventSource / SSE connections where browsers cannot set headers
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required: missing auth cookie or Bearer token",
            });
        }

        const decoded = jwtService.verifyToken(token);
        req.user = decoded;

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
};

export default authMiddleware;
