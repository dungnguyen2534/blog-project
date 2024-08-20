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
import { ImageUploadFilter } from "../middlewares/imageUpload";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  validateRequest(createPostSchema),
  PostsController.createPost
);

router.post(
  "/images",
  requireAuth,
  ImageUploadFilter.single("inPostImage"),
  validateRequest(InPostImageSchema),
  PostsController.uploadInPostImages
);

router.delete("/images", PostsController.deleteUnusedImage);

router.patch(
  "/:postId",
  requireAuth,
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

export default router;
