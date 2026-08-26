import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/github/login", authController.githubLogin);
router.get("/github/callback", authController.githubCallback);
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authController.logout);

export default router;
