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
  const { title, body, summary, images = [] } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    // delete temporary status of new images
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

    // delete unused images if there is any(when user post an image and change/delete before post)
    const unusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });

    if (unusedImages.length > 0) {
      const unusedImagePaths = unusedImages.map((image) => image.imagePath);

      for (const imagePath of unusedImagePaths) {
        const imagePathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagePathToDelete);
      }

      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagePaths } });
    }

    const newPost = await PostModel.create({
      slug: slugify(title),
      title,
      body,
      images: imagesPath,
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
  const { title, body, summary, images = [] } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const postToUpdate = await PostModel.findById(postId).exec();
    if (!postToUpdate) throw createHttpError(404, "Post not found");

    if (!authenticatedUser._id.equals(postToUpdate.author._id)) {
      throw createHttpError(403, "You are not authorized to update this post");
    }

    // check and delete any old unused images that not include in the update
    const newImages = images.map((url) => new URL(url).pathname);

    const oldUnusedImages = postToUpdate.images.filter(
      (image) => !newImages.includes(image)
    );

    if (oldUnusedImages.length > 0) {
      for (const imagePath of oldUnusedImages) {
        const imagePathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagePathToDelete);
      }
      await TempImageModel.deleteMany({
        imagePath: { $in: oldUnusedImages },
      });
    }

    // delete temporary status of new images
    await TempImageModel.updateMany(
      {
        userId: authenticatedUser._id,
        imagePath: { $in: newImages },
      },
      { $set: { temporary: false } }
    );

    // delete new unused images if there is any(when user post an image and change/delete before post)
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

    postToUpdate.slug = slugify(title);
    postToUpdate.title = title;
    postToUpdate.body = body;
    postToUpdate.images = newImages;
    postToUpdate.summary = summary;

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

    for (const imagePath of postToDelete.images) {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      await fs.promises.unlink(imagePathToDelete);
    }

    // cascade delete comments of the post
    const comments = await CommentModel.find({
      postId: postToDelete._id,
    }).exec();
    if (comments.length > 0) {
      for (const comment of comments) {
        for (const commentImagePath of comment.images) {
          const imagePathToDelete = path.join(
            __dirname,
            "../..",
            commentImagePath
          );
          await fs.promises.unlink(imagePathToDelete);
        }
      }
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
  const currentPage = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "12");
  const authorId = req.query.authorId;

  const filter = authorId ? { author: authorId } : {};

  try {
    const posts = await PostModel.find(filter)
      .sort({ _id: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate("author")
      .exec();

    const totalPages = Math.ceil(
      (await PostModel.countDocuments(filter)) / limit
    );

    res.status(200).json({ posts, totalPages, currentPage });
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
