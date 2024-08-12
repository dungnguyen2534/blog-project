import express from "express";
import * as PostsController from "../controllers/posts";
import validateRequest from "../middlewares/validateRequest";
import { PostSchema } from "../validation/posts";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  validateRequest(PostSchema),
  PostsController.createPost
);

router.get("/", PostsController.getPostList);

router.get("/slugs", PostsController.getSlugs);

router.get("/:slug", PostsController.getPost);

export default router;
