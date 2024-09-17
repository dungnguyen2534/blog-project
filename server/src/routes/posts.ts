import express from "express";
import * as PostsController from "../controllers/posts";
import validateRequest from "../middlewares/validateRequest";
import {
  createPostSchema,
  deletePostSchema,
  InPostImageSchema,
  updatePostSchema,
} from "../validation/posts";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import {
  // createPostLimiter,
  updatePostLimiter,
  uploadImagesLimiter,
} from "../middlewares/rate-limiter";
import deleteUnusedImage from "../utils/deleteUnusedImage";
import postCommentsRouter from "./post-comments";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  // createPostLimiter,
  validateRequest(createPostSchema),
  PostsController.createPost
);

router.post(
  "/images",
  requireAuth,
  uploadImagesLimiter,
  ImageUploadFilter.single("inPostImage"),
  validateRequest(InPostImageSchema),
  PostsController.uploadInPostImages
);

router.delete("/images", deleteUnusedImage);

router.patch(
  "/:postId",
  requireAuth,
  updatePostLimiter,
  validateRequest(updatePostSchema),
  PostsController.updatePost
);

router.delete(
  "/:postId",
  requireAuth,
  validateRequest(deletePostSchema),
  PostsController.deletePost
);

router.get("/", PostsController.getPostList);

router.get("/slugs", PostsController.getSlugs);

router.get("/:slug", PostsController.getPost);

// Comment routes
router.use("/:postId/comments", postCommentsRouter);

export default router;
