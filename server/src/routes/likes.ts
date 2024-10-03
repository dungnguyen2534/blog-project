import express from "express";
import { likeTarget, unlikeTarget } from "../controllers/likes";
import validateRequest from "../middlewares/validateRequest";
import { LikeSchema } from "../validation/likes";

const router = express.Router();

router.post(
  "/:targetType/:targetId/like",
  validateRequest(LikeSchema),
  likeTarget
);

router.post(
  "/:targetType/:targetId/unlike",
  validateRequest(LikeSchema),
  unlikeTarget
);

export default router;
