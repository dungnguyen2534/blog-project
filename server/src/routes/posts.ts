import express from "express";
import * as PostsController from "../controllers/posts";
import validateRequest from "../middlewares/validateRequest";
import { InPostImageSchema, PostSchema } from "../validation/posts";
import requireAuth from "../middlewares/requireAuth";
import { PostImages } from "../middlewares/imageUpload";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  validateRequest(PostSchema),
  PostsController.createPost
);

router.post(
  "/images",
  requireAuth,
  PostImages.single("inPostImage"),
  validateRequest(InPostImageSchema),
  PostsController.uploadInPostImages
);

router.delete("/images", PostsController.deleteUnusedImage);

router.get("/", PostsController.getPostList);

router.get("/slugs", PostsController.getSlugs);

router.get("/:slug", PostsController.getPost);

export default router;
