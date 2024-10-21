import express from "express";
import * as BookmarksController from "../controllers/bookmarks";
import requireAuth from "../middlewares/requireAuth";
import validateRequest from "../middlewares/validateRequest";
import {
  getSavedArticlesSchema,
  saveArticlesSchema,
} from "../validation/articles";

const router = express.Router({ mergeParams: true });

router.post(
  "/:articleId/save",
  requireAuth,
  validateRequest(saveArticlesSchema),
  BookmarksController.saveArticle
);

router.delete(
  "/:articleId/unsave",
  requireAuth,
  validateRequest(saveArticlesSchema),
  BookmarksController.unsaveArticle
);

router.get("/saved-tags", requireAuth, BookmarksController.getSavedTags);

router.get(
  "/saved-articles",
  requireAuth,
  validateRequest(getSavedArticlesSchema),
  BookmarksController.getSavedArticles
);

export default router;
