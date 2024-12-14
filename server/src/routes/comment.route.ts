import express from "express";
import * as ArticleCommentsController from "../controllers/comment.controller";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import { uploadImagesLimiter } from "../middlewares/rateLimiter";
import deleteUnusedImage from "../middlewares/deleteUnusedImage";

// prefix: articles/:articleId/comments
const router = express.Router({ mergeParams: true });

router.post("/", requireAuth, ArticleCommentsController.createComment);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inCommentImage"),
  ArticleCommentsController.uploadInCommentImage
);

router.delete("/images", deleteUnusedImage);

router.patch("/:commentId", requireAuth, ArticleCommentsController.editComment);

router.delete(
  "/:commentId",
  requireAuth,
  ArticleCommentsController.deleteComment
);

router.get("/", ArticleCommentsController.getCommentList);

export default router;
