import { RequestHandler } from "express";
import { slugify } from "../utils/slugify";
import PostModel from "../models/post";
import TempImageModel from "../models/tempImage";
import { PostBody } from "../validation/posts";
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
  PostBody,
  unknown
> = async (req, res, next) => {
  const { title, summary, images, body } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    if (images && images.length > 0) {
      const imagesToUpdate = images.map((url) => new URL(url).pathname);
      console.log("Pathnames to update:", imagesToUpdate);
      const updateResult = await TempImageModel.updateMany(
        {
          userId: authenticatedUser._id,
          imagePath: { $in: imagesToUpdate },
        },
        { $set: { temporary: false } }
      );
      console.log("Update result:", updateResult);
    }

    const unusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });
    console.log("Unused images before deletion:", unusedImages);

    if (unusedImages.length > 0) {
      for (const image of unusedImages) {
        const imagePath = path.join(__dirname, "../..", image.imagePath);
        await fs.promises.unlink(imagePath);
      }

      const unusedImagesIds = unusedImages.map((image) => image._id);
      await TempImageModel.deleteMany({ _id: { $in: unusedImagesIds } });
    }

    console.log("Images to update:", images);
    console.log("Unused images before deletion:", unusedImages);

    const newPost = await PostModel.create({
      slug: slugify(title) + "-" + nanoid(9),
      title,
      body,
      images,
      summary,
      author: authenticatedUser._id,
    });

    res.status(201).json(newPost);
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
      for (const image of unusedImages) {
        const imagePath = path.join(__dirname, "../..", image.imagePath);
        await fs.promises.unlink(imagePath);
      }

      const unusedImagesIds = unusedImages.map((image) => image._id);
      await TempImageModel.deleteMany({ _id: { $in: unusedImagesIds } });
    } else {
      return;
    }

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

export const getSlugs: RequestHandler = async (req, res, next) => {
  try {
    const result = await PostModel.find().select("slug").exec();

    const slugs = result.map((post) => post.slug);
    res.status(200).json(slugs);
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
