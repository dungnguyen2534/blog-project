import { RequestHandler } from "express";
import {
  FollowParams,
  GetFollowers,
  GetFollowing,
} from "../validation/follows";
import assertIsDefined from "../utils/assertIsDefined";
import FollowerModel from "../models/follower";
import UserModel from "../models/user";
import createHttpError from "http-errors";

export const followUser: RequestHandler<
  FollowParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const existingUser = await UserModel.exists({ _id: userId });
    if (!existingUser) {
      throw createHttpError(404, "User not found");
    }

    const existingFollower = await FollowerModel.exists({
      user: userId,
      follower: authenticatedUser._id,
    });

    if (existingFollower) {
      throw createHttpError(400, "You are already following this user");
    } else if (userId === authenticatedUser._id.toString()) {
      throw createHttpError(400, "You cannot follow yourself");
    }

    await FollowerModel.create({
      user: userId,
      follower: authenticatedUser._id,
    });

    await Promise.all([
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalFollowing: 1 },
      }),
      UserModel.findByIdAndUpdate(userId, {
        $inc: { totalFollowers: 1 },
      }),
    ]);

    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();
    res.status(201).json({ totalFollowers });
  } catch (error) {
    next(error);
  }
};

export const unFollowUser: RequestHandler<
  FollowParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const existingUser = await UserModel.exists({ _id: userId });
    if (!existingUser) {
      throw createHttpError(404, "User not found");
    }

    const existingFollower = await FollowerModel.exists({
      user: userId,
      follower: authenticatedUser._id,
    });

    if (!existingFollower) {
      throw createHttpError(400, "You are not following this user");
    }

    await FollowerModel.deleteOne({
      user: userId,
      follower: authenticatedUser._id,
    });

    await Promise.all([
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalFollowing: -1 },
      }),
      UserModel.findByIdAndUpdate(userId, {
        $inc: { totalFollowers: -1 },
      }),
    ]);

    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();
    res.status(201).json({ totalFollowers });
  } catch (error) {
    next(error);
  }
};

export const getFollowers: RequestHandler<
  unknown,
  unknown,
  unknown,
  GetFollowers
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { continueAfterId, limit = 30 } = req.query;

  try {
    assertIsDefined(authenticatedUser);

    const query = FollowerModel.find({
      user: authenticatedUser._id,
    });

    if (continueAfterId) {
      query.lt("_id", continueAfterId);
    }

    const result = await query
      .limit(limit + 1)
      .populate("follower")
      .lean()
      .exec();

    const followers = result
      .slice(0, limit)
      .map((follower) => follower.follower);

    const isLastFollowerReached = result.length <= limit;

    res.status(200).json({ followers, isLastFollowerReached });
  } catch (error) {
    next(error);
  }
};

export const getFollowing: RequestHandler<
  unknown,
  unknown,
  unknown,
  GetFollowing
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { continueAfterId, limit = 30 } = req.query;

  try {
    assertIsDefined(authenticatedUser);

    const query = FollowerModel.find({
      follower: authenticatedUser._id,
    });

    if (continueAfterId) {
      query.lt("_id", continueAfterId);
    }

    const result = await query
      .limit(limit + 1)
      .populate("user")
      .lean()
      .exec();

    const following = result.slice(0, limit).map((follow) => follow.user);
    const isLastFollowingReached = result.length <= limit;

    res.status(200).json({ following, isLastFollowingReached });
  } catch (error) {
    next(error);
  }
};
