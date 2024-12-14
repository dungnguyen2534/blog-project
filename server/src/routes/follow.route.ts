import express from "express";
import {
  followUser,
  getFollowers,
  getFollowings,
  unFollowUser,
} from "../controllers/follow.controller";
import requireAuth from "../middlewares/requireAuth";

// prefix: /users
const router = express.Router({ mergeParams: true });

router.post("/:userId/follow", requireAuth, followUser);

router.delete("/:userId/unfollow", requireAuth, unFollowUser);

router.get("/me/followers", requireAuth, getFollowers);

router.get("/me/following", requireAuth, getFollowings);

export default router;
