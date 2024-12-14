import express from "express";
import { likeTarget, unlikeTarget } from "../controllers/like.controller";
import requireAuth from "../middlewares/requireAuth";

// prefix: /interact
const router = express.Router();

router.post("/like/:targetType/:targetId/", requireAuth, likeTarget);

router.post("/unlike/:targetType/:targetId/", requireAuth, unlikeTarget);

export default router;
