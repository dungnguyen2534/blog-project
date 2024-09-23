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
      imagesPath = images.map((url) => new URL(url).pathname);
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

      for (const imagePath of unusedImagesPath) {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagesPathToDelete);
      }

      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagesPath } });
    }

    const newComment = await CommentModel.create({
      postId,
      author: authenticatedUser._id,
      parentCommentId,
      body,
      images: imagesPath,
    });

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

    const newImages = images?.map((url) => new URL(url).pathname);

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
        for (const imagePath of oldUnusedImages) {
          const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
          await fs.promises.unlink(imagesPathToDelete);
        }
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

      for (const imagePath of unusedImagesPath) {
        const unusedImagePath = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(unusedImagePath);
      }

      await TempImageModel.deleteMany({
        imagePath: { $in: unusedImagesPath },
      });
    }

    Object.assign(commentToUpdate, {
      body,
      ...(newImages && { images: newImages }),
    });

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

    for (const imagePath of commentToDelete.images) {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      await fs.promises.unlink(imagePathToDelete);
    }

    // cascade delete child comments
    const childComments = await CommentModel.find({
      parentCommentId: commentId,
    }).exec();
    if (childComments.length > 0) {
      for (const comment of childComments) {
        for (const commentImagePath of comment.images) {
          const imagePathToDelete = path.join(
            __dirname,
            "../..",
            commentImagePath
          );
          await fs.promises.unlink(imagePathToDelete);
        }
      }
      await CommentModel.deleteMany({ parentCommentId: commentId });
    }

    await commentToDelete.deleteOne();

    res.sendStatus(204);
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
  const currentPage = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "2");
  const { parentCommentId } = req.query;
  const { postId } = req.params;

  try {
    const comments = await CommentModel.find({ postId, parentCommentId })
      .sort({ _id: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate("author")
      .exec();

    const totalComments = await CommentModel.countDocuments({
      postId,
      parentCommentId,
    });

    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json({ comments, totalComments, totalPages, currentPage });
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
