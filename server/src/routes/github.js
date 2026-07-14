import express from "express";
import * as githubController from "../controllers/github.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/app",
    authMiddleware,
    githubController.getGitHubApp
);

router.get(
    "/install",
    authMiddleware,
    githubController.installApp
);

router.get(
    "/install/callback"
    , githubController.installCallback
);
router.get(
    "/repositories/sync",
    authMiddleware,
    githubController.syncRepositories
);

router.get(
    "/jobs",
    authMiddleware,
    githubController.getJobs
);

router.get(
    "/jobs/:jobId/logs",
    authMiddleware,
    githubController.getJobLogs
);

router.post(
    "/repositories/:repoId/trigger",
    authMiddleware,
    githubController.triggerManualBuild
);

export default router;