import express from "express";
import * as PostsController from "../controllers/posts";
import validateRequest from "../middlewares/validateRequest";
import { PostSchema } from "../validation/posts";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.get("/", PostsController.getPosts);

router.post(
  "/",
  requireAuth,
  validateRequest(PostSchema),
  PostsController.createPost
);

export default router;
