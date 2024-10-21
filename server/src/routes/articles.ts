import express from "express";
import * as ArticlesController from "../controllers/articles";
import validateRequest from "../middlewares/validateRequest";
import {
  createArticleSchema,
  deleteArticleSchema,
  getTopArticlesSchema,
  InArticleImageSchema,
  updateArticleSchema,
} from "../validation/articles";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import {
  // createArticleLimiter,
  updateArticleLimiter,
  uploadImagesLimiter,
} from "../middlewares/rate-limiter";
import deleteUnusedImage from "../utils/deleteUnusedImage";
import articleCommentsRouter from "./article-comments";
import bookmarksRouter from "./bookmarks";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  // createArticleLimiter,
  validateRequest(createArticleSchema),
  ArticlesController.createArticle
);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inArticleImage"),
  validateRequest(InArticleImageSchema),
  ArticlesController.uploadInArticleImages
);

router.delete("/images", deleteUnusedImage);

router.patch(
  "/:articleId",
  requireAuth,
  updateArticleLimiter,
  validateRequest(updateArticleSchema),
  ArticlesController.updateArticle
);

router.delete(
  "/:articleId",
  requireAuth,
  validateRequest(deleteArticleSchema),
  ArticlesController.deleteArticle
);

router.get("/", ArticlesController.getArticleList);

router.get(
  "/top/:timeSpan",
  validateRequest(getTopArticlesSchema),
  ArticlesController.getTopArticles
);

router.use("/", bookmarksRouter);

router.get("/slugs", ArticlesController.getSlugs);

router.get("/:slug", ArticlesController.getArticle);

router.use("/:articleId/comments", articleCommentsRouter);

export default router;
