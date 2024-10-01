import { RequestHandler } from "express";
import { slugify } from "../utils/slugify";
import PostModel from "../models/post";
import TempImageModel from "../models/tempImage";
import {
  createPostBody,
  deletePostParams,
  getPostsQuery,
  UpdatePostBody,
  updatePostParams,
} from "../validation/posts";
import createHttpError from "http-errors";
import assertIsDefined from "../utils/assertIsDefined";
import { nanoid } from "nanoid";
import sharp from "sharp";
import env from "../env";
import path from "path";
import fs from "fs";
import CommentModel from "../models/comment";

export const createPost: RequestHandler<
  unknown,
  unknown,
  createPostBody,
  unknown
> = async (req, res, next) => {
  const { title, body, summary, tags, images } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    // delete temporary status of new images
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

    // delete unused images if there is any(when user post an image and change/delete before post)
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

      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagePaths } });
    }

    const newPost = await PostModel.create({
      slug: slugify(title),
      title,
      body,
      tags,
      images: imagePaths,
      summary,
      author: authenticatedUser._id,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost: RequestHandler<
  updatePostParams,
  unknown,
  UpdatePostBody,
  unknown
> = async (req, res, next) => {
  const { postId } = req.params;
  const { title, body, summary, tags, images } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const postToUpdate = await PostModel.findById(postId).exec();
    if (!postToUpdate) throw createHttpError(404, "Post not found");

    if (!authenticatedUser._id.equals(postToUpdate.author._id)) {
      throw createHttpError(403, "You are not authorized to update this post");
    }

    // check and delete any old unused images that not include in the update
    const newImages = images?.map((url: string) => new URL(url).pathname);

    if (newImages) {
      // delete temporary status of new images
      await TempImageModel.updateMany(
        {
          userId: authenticatedUser._id,
          imagePath: { $in: newImages },
        },
        { $set: { temporary: false } }
      );

      const oldUnusedImages = postToUpdate.images.filter(
        (image) => !newImages.includes(image)
      );

      if (oldUnusedImages.length > 0) {
        const deletePromises = oldUnusedImages.map((imagePath) => {
          const imagePathToDelete = path.join(__dirname, "../..", imagePath);
          return fs.promises.unlink(imagePathToDelete);
        });

        await Promise.all(deletePromises);

        await TempImageModel.deleteMany({
          imagePath: { $in: oldUnusedImages },
        });
      }
    }

    // delete new unused images if there is any(when user post an image and change/delete before post)
    const newUnusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });

    if (newUnusedImages.length > 0) {
      const unusedImagesPath = newUnusedImages.map((image) => image.imagePath);

      const deletePromises = unusedImagesPath.map((imagePath) => {
        const unusedImagePath = path.join(__dirname, "../..", imagePath);
        return fs.promises.unlink(unusedImagePath);
      });

      await Promise.all(deletePromises);

      await TempImageModel.deleteMany({
        imagePath: { $in: unusedImagesPath },
      });
    }

    Object.assign(postToUpdate, {
      slug: slugify(title),
      title,
      body,
      ...(tags && { tags }),
      ...(newImages && { images: newImages }),
      summary,
    });

    await postToUpdate.save();
    res.status(200).json(postToUpdate);
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler<
  deletePostParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { postId } = req.params;

  try {
    assertIsDefined(authenticatedUser);

    const postToDelete = await PostModel.findById(postId).exec();
    if (!postToDelete) throw createHttpError(404, "Post not found");

    if (!authenticatedUser._id.equals(postToDelete.author._id)) {
      throw createHttpError(403, "You are not authorized to delete this post");
    }

    const deletePromises = postToDelete.images.map((imagePath) => {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      return fs.promises.unlink(imagePathToDelete);
    });

    await Promise.all(deletePromises);

    // cascade delete comments of the post
    const comments = await CommentModel.find({
      postId: postToDelete._id,
    }).exec();
    if (comments.length > 0) {
      const deletePromises = comments.flatMap((comment) =>
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
      await CommentModel.deleteMany({ postId: postToDelete._id });
    }

    await postToDelete.deleteOne();

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getPostList: RequestHandler<
  unknown,
  unknown,
  unknown,
  getPostsQuery
> = async (req, res, next) => {
  const limit = parseInt(req.query.limit || "12");
  const { authorId, tag, continueAfterId } = req.query;

  const filter = {
    ...(authorId ? { author: authorId } : {}),
    ...(tag ? { tags: "#" + tag } : {}),
  };

  try {
    const query = PostModel.find(filter).sort({ _id: -1 });

    if (continueAfterId) {
      query.lt("_id", continueAfterId);
    }

    const result = await query
      .limit(limit + 1)
      .populate("author")
      .exec();

    const posts = result.slice(0, limit);
    const lastPostReached = result.length <= limit;

    setTimeout(() => {
      res.status(200).json({ posts, lastPostReached });
    }, 700);
  } catch (error) {
    next(error);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const { slug } = req.params;

  try {
    const post = await PostModel.findOne({ slug }).populate("author").exec();
    if (!post) throw createHttpError(404, "Post not found");

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const getSlugs: RequestHandler = async (req, res, next) => {
  try {
    const result = await PostModel.find().select("slug").exec();
    const slugs = result.map((post) => post.slug);

    res.status(200).json(slugs);
  } catch (error) {
    next(error);
  }
};

export const uploadInPostImages: RequestHandler = async (req, res, next) => {
  const image = req.file;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);
    assertIsDefined(image);

    const fileName = nanoid();
    const imagePath =
      "/uploads/in-post-images/" + fileName + path.extname(image.originalname);

    await sharp(image.buffer)
      .resize(1920, undefined, { withoutEnlargement: true })
      .toFile("./" + imagePath);

    // create a temporary image document to compare and delete unused image when create post
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
