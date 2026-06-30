
import express from "express";
import * as githubController from "../controllers/github.controller.js";

const router = express.Router();

router.get("/app", githubController.getGitHubApp);

export default router;