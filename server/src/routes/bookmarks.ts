import express from "express";
import * as BookmarksController from "../controllers/bookmarks";
import requireAuth from "../middlewares/requireAuth";
import validateRequest from "../middlewares/validateRequest";
import { getSavedPostsSchema, savePostsSchema } from "../validation/posts";

const router = express.Router({ mergeParams: true });

router.post(
  "/:postId/save",
  requireAuth,
  validateRequest(savePostsSchema),
  BookmarksController.savePost
);

router.delete(
  "/:postId/unsave",
  requireAuth,
  validateRequest(savePostsSchema),
  BookmarksController.unsavePost
);

router.get("/saved-tags", requireAuth, BookmarksController.getSavedTags);

router.get(
  "/saved-posts",
  requireAuth,
  validateRequest(getSavedPostsSchema),
  BookmarksController.getSavedPosts
);

export default router;
