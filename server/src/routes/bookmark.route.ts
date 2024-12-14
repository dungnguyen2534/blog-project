import express from "express";
import * as BookmarksController from "../controllers/bookmark.controller";
import requireAuth from "../middlewares/requireAuth";

// prefix: /articles/bookmark
const router = express.Router({ mergeParams: true });

router.post("/:articleId", requireAuth, BookmarksController.bookmarkArticle);

router.delete(
  "/:articleId",
  requireAuth,
  BookmarksController.unBookmarkedArticle
);

router.get(
  "/bookmark-tags",
  requireAuth,
  BookmarksController.getTagListInBookmarks
);

router.get(
  "/bookmarked-articles",
  requireAuth,
  BookmarksController.getBookmarkedArticleList
);

export default router;
