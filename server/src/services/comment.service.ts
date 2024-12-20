import path from "path";
import fs from "fs";
import {
  CreateCommentParams,
  DeleteCommentParams,
  EditCommentParams,
  GetCommentListParams,
  GetCommentListQuery,
} from "../validation/request/comment.request";
import TempImageModel from "../models/tempImage.model";
import CommentModel from "../models/comment.model";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import sharp from "sharp";
import env from "../constant/env";
import ArticleModel from "../models/article.model";
import LikeModel from "../models/like.model";
import { CommentBody, CustomImageType } from "../validation/utils";
import { FORBIDDEN, NOT_FOUND } from "../constant/httpCode";

export const createCommentHandler = async (
  authenticatedUser: Express.User,
  requestParams: CreateCommentParams,
  requestBody: CommentBody
) => {
  const { parentCommentId, body, images } = requestBody;
  const { articleId } = requestParams;

  let imagePaths: string[] | undefined;
  if (images) {
    if (images.length > 0) {
      imagePaths = images.map((url: string) => new URL(url).pathname);
      await TempImageModel.updateMany(
        {
          userId: authenticatedUser._id,
          imagePath: { $in: imagePaths },
        },
        { $set: { temporary: false } }
      );
    }
  }

  const unusedImages = await TempImageModel.find({
    userId: authenticatedUser._id,
    temporary: true,
  });

  if (unusedImages.length > 0) {
    const unusedImagePaths = unusedImages.map((image) => image.imagePath);

    const deletePromises = unusedImagePaths.map((imagePath) => {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      return fs.promises.unlink(imagePathToDelete);
    });

    await Promise.all(deletePromises);
    await TempImageModel.deleteMany({
      imagePath: { $in: unusedImagePaths },
    });
  }

  const newComment = await CommentModel.create({
    articleId,
    author: authenticatedUser._id,
    parentCommentId,
    body,
    likeCount: 0,
    replyCount: 0,
    images: imagePaths,
  });

  const updateParentComment = parentCommentId
    ? CommentModel.updateOne(
        { _id: parentCommentId },
        { $inc: { replyCount: 1 } },
        { timestamps: false }
      )
    : Promise.resolve();

  await updateParentComment;

  await ArticleModel.updateOne(
    { _id: articleId },
    { $inc: { commentCount: 1 } },
    { timestamps: false }
  );

  await newComment.populate("author");

  return { newComment };
};

export const editCommentHandler = async (
  authenticatedUser: Express.User,
  params: EditCommentParams,
  commentData: CommentBody
) => {
  const { commentId } = params;
  const { body, images = [] } = commentData;

  const commentToUpdate = await CommentModel.findById(commentId).exec();
  if (!commentToUpdate) throw createHttpError(NOT_FOUND, "Comment not found");

  if (!authenticatedUser._id.equals(commentToUpdate.author._id)) {
    throw createHttpError(
      FORBIDDEN,
      "You are not authorized to edit this comment"
    );
  }

  const newImages = images?.map((url: string) => new URL(url).pathname);

  if (newImages) {
    await TempImageModel.updateMany(
      {
        userId: authenticatedUser._id,
        imagePath: { $in: newImages },
      },
      { $set: { temporary: false } }
    );

    const oldUnusedImages = commentToUpdate.images.filter(
      (image) => !newImages.includes(image)
    );

    if (oldUnusedImages.length > 0) {
      const deletePromises = oldUnusedImages.map(async (imagePath) => {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        return fs.promises.unlink(imagesPathToDelete).catch((error) => {
          if (error.code !== "ENOENT") {
            throw error;
          }
        });
      });

      await Promise.all(deletePromises);
      await TempImageModel.deleteMany({
        imagePath: { $in: oldUnusedImages },
      });
    }
  }

  const newUnusedImages = await TempImageModel.find({
    userId: authenticatedUser._id,
    temporary: true,
  });

  if (newUnusedImages.length > 0) {
    const unusedImagesPath = newUnusedImages.map((image) => image.imagePath);

    const deletePromises = unusedImagesPath.map(async (imagePath) => {
      const unusedImagePath = path.join(__dirname, "../..", imagePath);
      return fs.promises.unlink(unusedImagePath);
    });

    await Promise.all(deletePromises);
    await TempImageModel.deleteMany({
      imagePath: { $in: unusedImagesPath },
    });
  }

  Object.assign(commentToUpdate, {
    body,
    ...(newImages && { images: newImages }),
  });

  await commentToUpdate.populate("author");
  await commentToUpdate.save();

  return { updatedComment: commentToUpdate };
};

export const deleteCommentHandler = async (
  authenticatedUser: Express.User,
  params: DeleteCommentParams
) => {
  const { commentId } = params;

  const commentToDelete = await CommentModel.findById(commentId).exec();
  if (!commentToDelete) throw createHttpError(NOT_FOUND, "Comment not found");

  if (!authenticatedUser._id.equals(commentToDelete.author._id)) {
    throw createHttpError(
      FORBIDDEN,
      "You are not authorized to delete this comment"
    );
  }

  const deletePromises = commentToDelete.images.map(async (imagePath) => {
    const imagePathToDelete = path.join(__dirname, "../..", imagePath);
    return fs.promises.unlink(imagePathToDelete).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  });

  await Promise.all(deletePromises);

  let commentCountDecrement = 1;

  // cascade delete child comments
  const childComments = await CommentModel.find({
    parentCommentId: commentId,
  }).exec();
  if (childComments.length > 0) {
    commentCountDecrement += childComments.length;
    const deletePromises = childComments.flatMap((comment) =>
      comment.images.map((commentImagePath) => {
        const imagePathToDelete = path.join(
          __dirname,
          "../..",
          commentImagePath
        );
        return fs.promises.unlink(imagePathToDelete);
      })
    );

    await Promise.all(deletePromises);
    await CommentModel.deleteMany({ parentCommentId: commentId });
  }

  const updateArticle = ArticleModel.updateOne(
    { _id: commentToDelete.articleId },
    {
      $inc: {
        commentCount: -1 * commentCountDecrement,
      },
    },
    { timestamps: false }
  );

  const deleteComment = commentToDelete.deleteOne();
  const updateParentComment = commentToDelete.parentCommentId
    ? CommentModel.updateOne(
        { _id: commentToDelete.parentCommentId },
        { $inc: { replyCount: -1 } },
        { timestamps: false }
      )
    : Promise.resolve();

  await Promise.all([updateArticle, deleteComment, updateParentComment]);
  const totalComments = await CommentModel.countDocuments({
    articleId: commentToDelete.articleId,
  });

  return { totalComments };
};

export const getCommentListHandler = async (
  authenticatedUser: Express.User | undefined,
  params: GetCommentListParams,
  requestQuery: GetCommentListQuery
) => {
  const { articleId } = params;
  const limit = parseInt(requestQuery.limit || "12");
  const { parentCommentId, continueAfterId } = requestQuery;

  const query = CommentModel.find({
    articleId,
    parentCommentId,
  }).sort({ _id: parentCommentId ? 1 : -1 });

  if (continueAfterId) {
    if (parentCommentId) {
      query.gt("_id", continueAfterId);
    } else {
      query.lt("_id", continueAfterId);
    }
  }

  const [result, totalComments] = await Promise.all([
    query
      .limit(limit + 1)
      .populate("author")
      .lean()
      .exec(),
    CommentModel.countDocuments({ articleId }),
  ]);

  const commentList = result.slice(0, limit);
  const lastCommentReached = result.length <= limit;

  const commentsWithLikeStatus = await Promise.all(
    commentList.map(async (comment) => {
      const [isUserLikedComment, likeCount] = await Promise.all([
        authenticatedUser
          ? LikeModel.exists({
              userId: authenticatedUser._id,
              targetType: "comment",
              targetId: comment._id,
            })
          : Promise.resolve(false),
        LikeModel.countDocuments({
          targetId: comment._id,
          targetType: "comment",
        }),
      ]);

      return {
        ...comment,
        likeCount,
        ...(authenticatedUser && {
          isLoggedInUserLiked: !!isUserLikedComment,
        }),
      };
    })
  );

  return {
    comments: commentsWithLikeStatus,
    lastCommentReached,
    totalComments,
  };
};

export const uploadInCommentImageHandler = async (
  authenticatedUser: Express.User,
  image: CustomImageType
) => {
  const { width, height } = await sharp(image.buffer).metadata();

  const fileName = nanoid();
  const imagePath = `/uploads/in-comment-images/${fileName}_width=${width}_height=${height}.webp`;

  await sharp(image.buffer)
    .resize(1920, undefined, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(`./${imagePath}`);

  await TempImageModel.create({
    imagePath,
    userId: authenticatedUser._id,
    temporary: true,
  });

  return { imageUrl: env.SERVER_URL + imagePath };
};
