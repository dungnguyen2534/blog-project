import express from "express";
import { likeTarget, unlikeTarget } from "../controllers/likes";
import validateRequest from "../middlewares/validateRequest";
import { LikeSchema } from "../validation/likes";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.post(
  "/:targetType/:targetId/like",
  requireAuth,
  validateRequest(LikeSchema),
  likeTarget
);

router.post(
  "/:targetType/:targetId/unlike",
  requireAuth,
  validateRequest(LikeSchema),
  unlikeTarget
);

export default router;
