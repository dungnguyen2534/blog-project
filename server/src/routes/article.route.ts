import express from "express";
import * as ArticlesController from "../controllers/article.controller";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import {
  // createArticleLimiter,
  updateArticleLimiter,
  uploadImagesLimiter,
} from "../middlewares/rateLimiter";
import deleteUnusedImage from "../middlewares/deleteUnusedImage";
import articleCommentsRouter from "./comment.route";
import bookmarksRouter from "./bookmark.route";

// prefix: /articles
const router = express.Router();

router.post(
  "/",
  requireAuth,
  // createArticleLimiter,
  ArticlesController.createArticle
);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inArticleImage"),
  ArticlesController.uploadInArticleImage
);

router.delete("/images", deleteUnusedImage);

router.patch(
  "/:articleId",
  requireAuth,
  updateArticleLimiter,
  ArticlesController.updateArticle
);

router.delete("/:articleId", requireAuth, ArticlesController.deleteArticle);

router.get("/", ArticlesController.getArticleList);

router.get("/top/:timeSpan", ArticlesController.getTopArticleList);

router.use("/bookmark", bookmarksRouter);

router.get("/slugs", ArticlesController.getSlugs);

router.get("/:slug", ArticlesController.getArticle);

router.use("/:articleId/comments", articleCommentsRouter);

export default router;
