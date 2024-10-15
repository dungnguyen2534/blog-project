import express from "express";
import {
  followTag,
  getTagInfo,
  getTags,
  unFollowTag,
} from "../controllers/tags";
import requireAuth from "../middlewares/requireAuth";
import validateRequest from "../middlewares/validateRequest";
import { TagSchema } from "../validation/tags";

const router = express.Router();

router.get("/", validateRequest(TagSchema), getTags);
router.get("/:tagName", validateRequest(TagSchema), getTagInfo);

router.post(
  "/:tagName/follow",
  requireAuth,
  validateRequest(TagSchema),
  followTag
);

router.delete(
  "/:tagName/unfollow",
  requireAuth,
  validateRequest(TagSchema),
  unFollowTag
);

export default router;
