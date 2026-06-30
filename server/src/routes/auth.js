import express from "express";
import * as authController from "../controllers/auth.controller.js"

const router = express.Router();

router.get("/github/login", authController.githubLogin);

export default router;