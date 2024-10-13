import express from "express";
import * as BookmarksController from "../controllers/bookmarks";
import requireAuth from "../middlewares/requireAuth";
import validateRequest from "../middlewares/validateRequest";
import { savePostsSchema } from "../validation/posts";

const router = express.Router({ mergeParams: true });

router.post(
  "/save",
  requireAuth,
  validateRequest(savePostsSchema),
  BookmarksController.savePost
);

router.delete(
  "/unsave",
  requireAuth,
  validateRequest(savePostsSchema),
  BookmarksController.unsavePost
);

export default router;
