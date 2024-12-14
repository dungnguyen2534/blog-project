import { LikeParams } from "../validation/request/like.request";
import LikeModel from "../models/like.model";
import ArticleModel from "../models/article.model";
import CommentModel from "../models/comment.model";
import createHttpError from "http-errors";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constant/httpCode";

export const likeTargetHandler = async (
  authenticatedUser: Express.User,
  params: LikeParams
) => {
  const { targetId, targetType } = params;
  const userId = authenticatedUser._id;

  const targetModel =
    targetType === "article"
      ? ArticleModel
      : targetType === "comment"
      ? CommentModel
      : null;
  if (!targetModel) {
    throw createHttpError(BAD_REQUEST, "Invalid target type");
  }

  const [target, existingLike] = await Promise.all([
    (targetModel as typeof ArticleModel & typeof CommentModel).findById(
      targetId
    ),
    LikeModel.findOne({ userId, targetType, targetId }),
  ]);

  if (!target) throw createHttpError(NOT_FOUND, `${targetType} not found`);

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

    return { statusCode: CREATED, totalLikes: likeCount };
  } else {
    const likeCount = await LikeModel.countDocuments({
      targetId,
      targetType,
    });

    return { statusCode: OK, totalLikes: likeCount };
  }
};

export const unlikeTargetHandler = async (
  authenticatedUser: Express.User,
  params: LikeParams
) => {
  const { targetId, targetType } = params;
  const userId = authenticatedUser._id;

  const targetModel =
    targetType === "article"
      ? ArticleModel
      : targetType === "comment"
      ? CommentModel
      : null;
  if (!targetModel) {
    throw createHttpError(BAD_REQUEST, "Invalid target type");
  }

  const [target, existingLike] = await Promise.all([
    (targetModel as typeof ArticleModel & typeof CommentModel).findById(
      targetId
    ),
    LikeModel.findOne({ userId, targetType, targetId }),
  ]);

  if (!target) throw createHttpError(NOT_FOUND, `${targetType} not found`);

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

    return { statusCode: OK, totalLikes: likeCount };
  } else {
    const likeCount = await LikeModel.countDocuments({
      targetId,
      targetType,
    });
    return { statusCode: OK, totalLikes: likeCount };
  }
};
