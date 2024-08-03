import express from "express";
import * as PostsController from "../controller/posts";

const router = express.Router();

router.get("/", PostsController.getPosts);

router.post("/", PostsController.createPost);

export default router;
