import LikeModel from "../models/like";
import PostModel from "../models/post";
import CommentModel from "../models/comment";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import assertIsDefined from "../utils/assertIsDefined";
import { LikeParams } from "../validation/likes";

export const likeTarget: RequestHandler<
  LikeParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { targetId, targetType } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);
    const userId = authenticatedUser._id;

    let targetModel;
    if (targetType === "post") {
      targetModel = PostModel;
    } else if (targetType === "comment") {
      targetModel = CommentModel;
    } else {
      throw createHttpError(400, "Invalid target type");
    }

    const target = await (
      targetModel as typeof PostModel & typeof CommentModel
    ).findById(targetId);

    if (!target) throw createHttpError(404, `${targetType} not found`);

    const existingLike = await LikeModel.findOne({
      userId,
      targetType,
      targetId,
    });

    if (!existingLike) {
      await LikeModel.create({ userId, targetType, targetId });
    }

    const likeCount = await LikeModel.countDocuments({ targetId, targetType });
    res.status(200).json({ totalLikes: likeCount });
  } catch (error) {
    next(error);
  }
};

export const unlikeTarget: RequestHandler<
  LikeParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { targetId, targetType } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    let targetModel;
    if (targetType === "post") {
      targetModel = PostModel;
    } else if (targetType === "comment") {
      targetModel = CommentModel;
    } else {
      throw createHttpError(400, "Invalid target type");
    }

    const target = await (
      targetModel as typeof PostModel & typeof CommentModel
    ).findById(targetId);
    if (!target) throw createHttpError(404, `${targetType} not found`);

    await LikeModel.deleteOne({
      userId: authenticatedUser._id,
      targetType,
      targetId,
    });

    const likeCount = await LikeModel.countDocuments({ targetId, targetType });
    res.status(200).json({ totalLikes: likeCount });
  } catch (error) {
    next(error);
  }
};
