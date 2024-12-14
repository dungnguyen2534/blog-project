import express from "express";
import {
  followTag,
  getTagInfo,
  getTagList,
  unFollowTag,
} from "../controllers/tag.controller";
import requireAuth from "../middlewares/requireAuth";

// prefix: /tags
const router = express.Router();

router.get("/", getTagList);

router.get("/:tagName", getTagInfo);

router.post("/:tagName/follow", requireAuth, followTag);

router.delete("/:tagName/unfollow", requireAuth, unFollowTag);

export default router;
