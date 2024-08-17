import { RequestHandler } from "express";
import { slugify } from "../utils/slugify";
import PostModel from "../models/post";
import TempImageModel from "../models/tempImage";
import {
  createPostBody,
  deletePostParams,
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

export const createPost: RequestHandler<
  unknown,
  unknown,
  createPostBody,
  unknown
> = async (req, res, next) => {
  const { title, summary, images, body } = req.body;
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
    const unusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });

    // delete unused images if there is any(when user post an image and change/delete before post)
    if (unusedImages.length > 0) {
      const unusedImagesPath = unusedImages.map((image) => image.imagePath);

      for (const imagePath of unusedImagesPath) {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagesPathToDelete);
      }

      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagesPath } });
    }

    const newPost = await PostModel.create({
      slug: slugify(title) + "-" + nanoid(9),
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
  const { title, summary, images, body } = req.body;
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

    console.log(oldUnusedImages);

    if (oldUnusedImages.length > 0) {
      for (const imagePath of oldUnusedImages) {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagesPathToDelete);
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
      const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
      await fs.promises.unlink(imagesPathToDelete);
    }

    await postToDelete.deleteOne();

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getPostList: RequestHandler = async (req, res, next) => {
  try {
    const allPosts = await PostModel.find()
      .sort({ _id: -1 })
      .populate("author")
      .exec();
    res.status(200).json(allPosts);
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

export const deleteUnusedImage: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    if (!authenticatedUser) return;

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
    } else {
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
