import express from "express";
import * as PostCommentsController from "../controllers/post-comments";
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
  PostCommentsController.createComment
);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inCommentImage"),
  validateRequest(InCommentImageSchema),
  PostCommentsController.uploadInCommentImages
);

router.delete("/images", deleteUnusedImage);

router.patch(
  "/:commentId",
  requireAuth,
  validateRequest(editCommentSchema),
  PostCommentsController.editComment
);

router.delete(
  "/:commentId",
  requireAuth,
  validateRequest(deleteCommentSchema),
  PostCommentsController.deleteComment
);

router.get("/", PostCommentsController.getCommentList);

export default router;
