import * as jwtService from "../services/jwt.service.js";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required: missing Bearer token or token query parameter",
            });
        }

        const decoded = jwtService.verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export default authMiddleware;