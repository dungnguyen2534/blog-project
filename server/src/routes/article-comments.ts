import express from "express";
import * as ArticleCommentsController from "../controllers/article-comments";
import validateRequest from "../middlewares/validateRequest";
import {
  createCommentSchema,
  editCommentSchema,
  deleteCommentSchema,
  InCommentImageSchema,
} from "../validation/comments";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import { uploadImagesLimiter } from "../middlewares/rate-limiter";
import deleteUnusedImage from "../utils/deleteUnusedImage";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  validateRequest(createCommentSchema),
  ArticleCommentsController.createComment
);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inCommentImage"),
  validateRequest(InCommentImageSchema),
  ArticleCommentsController.uploadInCommentImages
);

router.delete("/images", deleteUnusedImage);

router.patch(
  "/:commentId",
  requireAuth,
  validateRequest(editCommentSchema),
  ArticleCommentsController.editComment
);

router.delete(
  "/:commentId",
  requireAuth,
  validateRequest(deleteCommentSchema),
  ArticleCommentsController.deleteComment
);

router.get("/", ArticleCommentsController.getCommentList);

export default router;
