import express from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  unFollowUser,
} from "../controllers/follows";
import requireAuth from "../middlewares/requireAuth";
import validateRequest from "../middlewares/validateRequest";
import {
  FollowSchema,
  GetFollowersSchema,
  GetFollowingSchema,
} from "../validation/follows";

const router = express.Router({ mergeParams: true });

router.post(
  "/:userId/follow",
  requireAuth,
  validateRequest(FollowSchema),
  followUser
);

router.delete(
  "/:userId/unfollow",
  requireAuth,
  validateRequest(FollowSchema),
  unFollowUser
);

router.get(
  "/me/followers",
  requireAuth,
  validateRequest(GetFollowersSchema),
  getFollowers
);

router.get(
  "/me/following",
  requireAuth,
  validateRequest(GetFollowingSchema),
  getFollowing
);

export default router;
