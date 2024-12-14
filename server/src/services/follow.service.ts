import {
  FollowUserParams,
  GetFollowersQuery,
  GetFollowingsQuery,
} from "../validation/request/follow.request";
import FollowerModel from "../models/follower.model";
import UserModel from "../models/user.model";
import createHttpError from "http-errors";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constant/httpCode";

export const followUserHandler = async (
  authenticatedUser: Express.User,
  params: FollowUserParams
) => {
  const { userId } = params;

  if (userId === authenticatedUser._id.toString()) {
    throw createHttpError(BAD_REQUEST, "You cannot follow yourself");
  }

  const [existingUser, existingFollower] = await Promise.all([
    UserModel.exists({ _id: userId }),
    FollowerModel.exists({ user: userId, follower: authenticatedUser._id }),
  ]);

  if (!existingUser) {
    throw createHttpError(NOT_FOUND, "User not found");
  }

  if (!existingFollower) {
    await FollowerModel.create({
      user: userId,
      follower: authenticatedUser._id,
    });

    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();

    await Promise.all([
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalFollowing: 1 },
      }),
      UserModel.findByIdAndUpdate(userId, { totalFollowers }),
    ]);

    return { statusCode: CREATED, totalFollowers };
  } else {
    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();

    return { statusCode: OK, totalFollowers };
  }
};

export const unFollowUserHandler = async (
  authenticatedUser: Express.User,
  params: FollowUserParams
) => {
  const { userId } = params;

  const [existingUser, existingFollower] = await Promise.all([
    UserModel.exists({ _id: userId }),
    FollowerModel.exists({ user: userId, follower: authenticatedUser._id }),
  ]);

  if (!existingUser) {
    throw createHttpError(NOT_FOUND, "User not found");
  }

  if (!existingFollower) {
    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();

    return { statusCode: OK, totalFollowers };
  } else {
    await FollowerModel.deleteOne({
      user: userId,
      follower: authenticatedUser._id,
    });
    const totalFollowers = await FollowerModel.countDocuments({
      user: userId,
    }).exec();

    await Promise.all([
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalFollowing: -1 },
      }),
      UserModel.findByIdAndUpdate(userId, { totalFollowers }),
    ]);

    return { statusCode: CREATED, totalFollowers };
  }
};

export const getFollowersHandler = async (
  authenticatedUser: Express.User,
  requestQuery: GetFollowersQuery
) => {
  const { continueAfterId } = requestQuery;
  const limit = parseInt(requestQuery.limit || "30");

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

  const followers = result.slice(0, limit).map((follower) => follower.follower);

  const isLastFollowerReached = result.length <= limit;

  return { followers, isLastFollowerReached };
};

export const getFollowingsHandler = async (
  authenticatedUser: Express.User,
  requestQuery: GetFollowingsQuery
) => {
  const { continueAfterId } = requestQuery;
  const limit = parseInt(requestQuery.limit || "30");

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

  return { following, isLastFollowingReached };
};
