import { RequestHandler } from "express";
import assertIsDefined from "../utils/assertIsDefined";
import path from "path";
import fs from "fs";
import {
  CreateCommentBody,
  CreateCommentParams,
  DeleteCommentParams,
  EditCommentBody,
  EditCommentParams,
  GetCommentsParams,
  GetCommentsQuery,
} from "../validation/comments";
import TempImageModel from "../models/tempImage";
import CommentModel from "../models/comment";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import sharp from "sharp";
import env from "../env";
import PostModel from "../models/post";
import LikeModel from "../models/like";

export const createComment: RequestHandler<
  CreateCommentParams,
  unknown,
  CreateCommentBody,
  unknown
> = async (req, res, next) => {
  const { parentCommentId, body, images = [] } = req.body;
  const { postId } = req.params;

  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    let imagesPath;
    if (images.length > 0) {
      imagesPath = images.map((url: string) => new URL(url).pathname);
      await TempImageModel.updateMany(
        {
          userId: authenticatedUser._id,
          imagePath: { $in: imagesPath },
        },
        { $set: { temporary: false } }
      );
    }

    const unusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });

    if (unusedImages.length > 0) {
      const unusedImagesPath = unusedImages.map((image) => image.imagePath);

      const deletePromises = unusedImagesPath.map(async (imagePath) => {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        return fs.promises.unlink(imagesPathToDelete);
      });

      await Promise.all(deletePromises);
      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagesPath } });
    }

    const newComment = await CommentModel.create({
      postId,
      author: authenticatedUser._id,
      parentCommentId,
      body,
      likeCount: 0,
      images: imagesPath,
    });

    await PostModel.updateOne(
      { _id: postId },
      { $inc: { commentCount: 1 } },
      { timestamps: false }
    );
    await newComment.populate("author");
    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const editComment: RequestHandler<
  EditCommentParams,
  unknown,
  EditCommentBody,
  unknown
> = async (req, res, next) => {
  const { commentId } = req.params;
  const { body, images } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const commentToUpdate = await CommentModel.findById(commentId).exec();
    if (!commentToUpdate) throw createHttpError(404, "Comment not found");

    if (!authenticatedUser._id.equals(commentToUpdate.author._id)) {
      throw createHttpError(403, "You are not authorized to edit this comment");
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

    res.status(200).json(commentToUpdate);
  } catch (error) {
    next(error);
  }
};

export const deleteComment: RequestHandler<
  DeleteCommentParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { commentId } = req.params;

  try {
    assertIsDefined(authenticatedUser);

    const commentToDelete = await CommentModel.findById(commentId).exec();
    if (!commentToDelete) throw createHttpError(404, "Comment not found");

    if (!authenticatedUser._id.equals(commentToDelete.author._id)) {
      throw createHttpError(
        403,
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

    await PostModel.updateOne(
      { _id: commentToDelete.postId },
      { $inc: { commentCount: -1 * commentCountDecrement } },
      { timestamps: false }
    );

    await commentToDelete.deleteOne();

    const totalComments = await CommentModel.countDocuments({
      postId: commentToDelete.postId,
    });

    res.status(200).json({ totalComments });
  } catch (error) {
    next(error);
  }
};

export const getCommentList: RequestHandler<
  GetCommentsParams,
  unknown,
  unknown,
  GetCommentsQuery
> = async (req, res, next) => {
  const { postId } = req.params;
  const limit = parseInt(req.query.limit || "12");
  const { parentCommentId, continueAfterId } = req.query;

  try {
    const query = CommentModel.find({
      postId,
      parentCommentId,
    }).sort({ _id: parentCommentId ? 1 : -1 });

    if (continueAfterId) {
      if (parentCommentId) {
        query.gt("_id", continueAfterId);
      } else {
        query.lt("_id", continueAfterId);
      }
    }

    const result = await query
      .limit(limit + 1)
      .populate("author")
      .lean()
      .exec();
    const commentList = result.slice(0, limit);
    const lastCommentReached = result.length <= limit;

    const totalComments = await CommentModel.countDocuments({ postId });

    const commentsWithLikeStatus = await Promise.all(
      commentList.map(async (comment) => {
        let isUserLikedComment;
        if (req.user) {
          isUserLikedComment = await LikeModel.exists({
            userId: req.user?._id,
            targetType: "comment",
            targetId: comment._id,
          });
        }

        const likeCount = await LikeModel.countDocuments({
          targetId: comment._id,
          targetType: "comment",
        });
        return {
          ...comment,
          likeCount,
          ...(req.user && {
            isLoggedInUserLiked: !!isUserLikedComment,
            loggedInUserLikedId: isUserLikedComment ? req.user?._id : undefined,
          }),
        };
      })
    );

    res.status(200).json({
      comments: commentsWithLikeStatus,
      lastCommentReached,
      totalComments,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadInCommentImages: RequestHandler = async (req, res, next) => {
  const image = req.file;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);
    assertIsDefined(image);

    const fileName = nanoid();
    const imagePath =
      "/uploads/in-comment-images/" +
      fileName +
      path.extname(image.originalname);

    await sharp(image.buffer)
      .resize(1920, undefined, { withoutEnlargement: true })
      .toFile("./" + imagePath);

    await TempImageModel.create({
      imagePath,
      userId: authenticatedUser._id,
      temporary: true,
    });

    res.status(201).json({ imageUrl: env.SERVER_URL + imagePath });
  } catch (error) {
    next(error);
  }
};
