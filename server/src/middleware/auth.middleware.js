import * as jwtService from "../services/jwt.service.js";

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwtService.verifyToken(token);

        console.log(decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: error.message,
        });

    }

};

export default authMiddleware;