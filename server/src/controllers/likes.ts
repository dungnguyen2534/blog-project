import LikeModel from "../models/like";
import ArticleModel from "../models/article";
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

    const targetModel =
      targetType === "article"
        ? ArticleModel
        : targetType === "comment"
        ? CommentModel
        : null;
    if (!targetModel) {
      throw createHttpError(400, "Invalid target type");
    }

    const [target, existingLike] = await Promise.all([
      (targetModel as typeof ArticleModel & typeof CommentModel).findById(
        targetId
      ),
      LikeModel.findOne({ userId, targetType, targetId }),
    ]);

    if (!target) throw createHttpError(404, `${targetType} not found`);

    if (!existingLike) {
      await LikeModel.create({ userId, targetType, targetId });
      if (targetType === "article") {
        await ArticleModel.updateOne(
          { _id: targetId },
          {
            $inc: { likeCount: 1 },
          },
          { timestamps: false }
        );
      } else if (targetType === "comment") {
        await CommentModel.updateOne(
          { _id: targetId },
          {
            $inc: { likeCount: 1 },
          },
          { timestamps: false }
        );
      }
      const likeCount = await LikeModel.countDocuments({
        targetId,
        targetType,
      });
      res.status(201).json({ totalLikes: likeCount });
    } else {
      const likeCount = await LikeModel.countDocuments({
        targetId,
        targetType,
      });
      res.status(200).json({ totalLikes: likeCount });
    }
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
    const userId = authenticatedUser._id;

    const targetModel =
      targetType === "article"
        ? ArticleModel
        : targetType === "comment"
        ? CommentModel
        : null;
    if (!targetModel) {
      throw createHttpError(400, "Invalid target type");
    }

    const [target, existingLike] = await Promise.all([
      (targetModel as typeof ArticleModel & typeof CommentModel).findById(
        targetId
      ),
      LikeModel.findOne({ userId, targetType, targetId }),
    ]);

    if (!target) throw createHttpError(404, `${targetType} not found`);

    if (existingLike) {
      await LikeModel.deleteOne({ userId, targetType, targetId });
      if (targetType === "article") {
        await ArticleModel.updateOne(
          { _id: targetId },
          {
            $inc: { likeCount: -1 },
          },
          { timestamps: false }
        );
      } else if (targetType === "comment") {
        await CommentModel.updateOne(
          { _id: targetId },
          {
            $inc: { likeCount: -1 },
          },
          { timestamps: false }
        );
      }

      const likeCount = await LikeModel.countDocuments({
        targetId,
        targetType,
      });
      res.status(204).json({ totalLikes: likeCount });
    } else {
      const likeCount = await LikeModel.countDocuments({
        targetId,
        targetType,
      });
      res.status(200).json({ totalLikes: likeCount });
    }
  } catch (error) {
    next(error);
  }
};
