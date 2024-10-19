import { RequestHandler } from "express";
import { slugify } from "../utils/slugify";
import PostModel from "../models/post";
import TempImageModel from "../models/tempImage";
import {
  createPostBody,
  deletePostParams,
  getPostsQuery,
  getTopPostsParams,
  getTopPostsQuery,
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
import LikeModel from "../models/like";
import UserModel from "../models/user";
import FollowerModel from "../models/follower";
import TagModel from "../models/tag";
import userTagsModel from "../models/userTags";
import SavedPostModel from "../models/savedPost";

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

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { postCount: 1 } }
          );
        } else {
          await TagModel.create({ tagName: tag, postCount: 1 });
        }
      });

      await Promise.all(tagPromises);
    }

    const [newPost] = await Promise.all([
      PostModel.create({
        slug: slugify(title),
        title,
        body,
        tags,
        images: imagePaths,
        summary,
        author: authenticatedUser._id,
      }),
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalPosts: 1 },
      }),
    ]);

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
        const deletePromises = oldUnusedImages.map(async (imagePath) => {
          const imagePathToDelete = path.join(__dirname, "../..", imagePath);
          return fs.promises.unlink(imagePathToDelete).catch((error) => {
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

    if (tags) {
      const tagsToAdd = tags.filter((tag) => !postToUpdate.tags.includes(tag));
      const tagsToRemove = postToUpdate.tags.filter(
        (tag) => !tags.includes(tag)
      );

      const addTagPromises = tagsToAdd.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { postCount: 1 } }
          );
        } else {
          await TagModel.create({ tagName: tag, postCount: 1 });
        }
      });

      const removeTagPromises = tagsToRemove.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { postCount: -1 } }
          );
        }
      });

      await Promise.all([...addTagPromises, ...removeTagPromises]);
    }

    if (postToUpdate.title !== title) {
      await SavedPostModel.updateMany(
        { postId: postToUpdate._id },
        { postTitle: title }
      );
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

    const deletePromises = postToDelete.images.map(async (imagePath) => {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      return fs.promises.unlink(imagePathToDelete).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
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

    if (postToDelete.tags && postToDelete.tags.length > 0) {
      const tagPromises = postToDelete.tags.map(async (tag) => {
        const existingTag = await TagModel.findOne({ tagName: tag });
        if (existingTag) {
          if (existingTag.postCount === 1 && existingTag.followerCount === 0) {
            await existingTag.deleteOne();
          } else {
            await TagModel.updateOne(
              { tagName: tag },
              { $inc: { postCount: -1 } }
            );
          }
        }
      });

      await Promise.all(tagPromises);
    }

    await Promise.all([
      LikeModel.deleteMany({
        targetId: postToDelete._id,
        targetType: "post",
      }),
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalPosts: -1 },
      }),
      postToDelete.deleteOne(),
    ]);

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
  const { authorId, tag, continueAfterId, followedTarget } = req.query;
  const authenticatedUser = req.user;

  const filter = {
    ...(authorId ? { author: authorId } : {}),
    ...(tag ? { tags: "#" + tag } : {}),
  };

  try {
    let query = PostModel.find(filter).sort({ _id: -1 });

    if (followedTarget) {
      assertIsDefined(authenticatedUser);

      if (followedTarget === "users") {
        const following = await FollowerModel.find({
          follower: authenticatedUser._id,
        }).exec();

        const followingUserIds = following.map((f) => f.user);
        query = PostModel.find({
          author: { $in: followingUserIds },
        }).sort({ _id: -1 });
      } else if (followedTarget === "tags") {
        const userTagsInfo = await userTagsModel
          .findOne({ user: authenticatedUser._id })
          .exec();

        const followedTags = userTagsInfo?.followedTags;
        query = PostModel.find({
          tags: { $in: followedTags },
        }).sort({ _id: -1 });
      } else if (followedTarget === "all") {
        const following = await FollowerModel.find({
          follower: authenticatedUser._id,
        }).exec();

        const followingUserIds = following.map((f) => f.user);
        const followedTags = (
          await userTagsModel.findOne({ user: authenticatedUser._id }).exec()
        )?.followedTags;

        query = PostModel.find({
          $or: [
            { author: { $in: followingUserIds } },
            { tags: { $in: followedTags } },
          ],
        }).sort({ _id: -1 });
      }
    }

    if (continueAfterId) {
      query = query.lt("_id", continueAfterId).sort({ _id: -1 });
    }

    const result = await query
      .limit(limit + 1)
      .populate("author")
      .lean()
      .exec();

    const postList = result.slice(0, limit);
    const lastPostReached = result.length <= limit;

    const postsWithStatus = await Promise.all(
      postList.map(async (post) => {
        const [
          isUserLikedPost,
          isLoggedInUserFollowing,
          likeCount,
          isSavedPost,
        ] = await Promise.all([
          authenticatedUser
            ? LikeModel.exists({
                userId: authenticatedUser._id,
                targetType: "post",
                targetId: post._id,
              })
            : Promise.resolve(false),
          authenticatedUser
            ? FollowerModel.exists({
                user: post.author._id,
                follower: authenticatedUser._id,
              })
            : Promise.resolve(false),
          LikeModel.countDocuments({
            targetId: post._id,
            targetType: "post",
          }),
          authenticatedUser
            ? SavedPostModel.exists({
                userId: authenticatedUser._id,
                postId: post._id,
              })
            : Promise.resolve(false),
        ]);

        return {
          ...post,
          likeCount,
          ...(authenticatedUser && {
            isLoggedInUserLiked: !!isUserLikedPost,
            author: {
              ...post.author,
              isLoggedInUserFollowing: !!isLoggedInUserFollowing,
            },
          }),
          ...(authenticatedUser && { isSavedPost: !!isSavedPost }),
        };
      })
    );

    res.status(200).json({ posts: postsWithStatus, lastPostReached });
  } catch (error) {
    next(error);
  }
};

export const getTopPosts: RequestHandler<
  getTopPostsParams,
  unknown,
  unknown,
  getTopPostsQuery
> = async (req, res, next) => {
  const { timeSpan } = req.params;
  const limit = parseInt(req.query.limit || "12");
  const { continueAfterLikeCount, continueAfterId } = req.query;

  const currentDate = new Date();
  let endDate: Date;
  const authenticatedUser = req.user;

  switch (timeSpan) {
    case "week":
      endDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      break;
    case "month":
      endDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      break;
    case "year":
      endDate = new Date(
        currentDate.setFullYear(currentDate.getFullYear() - 1)
      );
      break;
    case "infinity":
      endDate = new Date(0);
      break;
    default:
      return res.status(404).json({ error: "Invalid time span" });
  }

  const filter = {
    createdAt: { $gte: endDate },
  };

  try {
    const query = PostModel.find(filter).sort({ likeCount: -1, createdAt: -1 });

    if (continueAfterLikeCount && continueAfterId) {
      query.find({
        ...filter,
        ...{
          likeCount: { $lte: continueAfterLikeCount },
          _id: { $lt: continueAfterId },
        },
      });
    }

    const result = await query
      .limit(limit + 1)
      .populate("author")
      .lean()
      .exec();

    const postList = result.slice(0, limit);
    const lastPostReached = result.length <= limit;

    const postsWithStatus = await Promise.all(
      postList.map(async (post) => {
        const [
          isUserLikedPost,
          isLoggedInUserFollowing,
          likeCount,
          isSavedPost,
        ] = await Promise.all([
          authenticatedUser
            ? LikeModel.exists({
                userId: authenticatedUser._id,
                targetType: "post",
                targetId: post._id,
              })
            : Promise.resolve(false),
          authenticatedUser
            ? FollowerModel.exists({
                user: post.author._id,
                follower: authenticatedUser._id,
              })
            : Promise.resolve(false),
          LikeModel.countDocuments({
            targetId: post._id,
            targetType: "post",
          }),
          authenticatedUser
            ? SavedPostModel.exists({
                userId: authenticatedUser._id,
                postId: post._id,
              })
            : Promise.resolve(false),
        ]);

        return {
          ...post,
          likeCount,
          ...(authenticatedUser && {
            isLoggedInUserLiked: !!isUserLikedPost,
            author: {
              ...post.author,
              isLoggedInUserFollowing: !!isLoggedInUserFollowing,
            },
          }),
          ...(authenticatedUser && { isSavedPost: !!isSavedPost }),
        };
      })
    );

    res.status(200).json({ posts: postsWithStatus, lastPostReached });
  } catch (error) {
    next(error);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const { slug } = req.params;
  const authenticatedUser = req.user;

  try {
    const result = await PostModel.findOne({ slug })
      .populate("author")
      .lean()
      .exec();
    if (!result) throw createHttpError(404, "Post not found");

    const [isUserLikedPost, isLoggedInUserFollowing, isSavedPost] =
      await Promise.all([
        authenticatedUser
          ? LikeModel.exists({
              userId: authenticatedUser._id,
              targetType: "post",
              targetId: result._id,
            })
          : Promise.resolve(false),
        authenticatedUser
          ? FollowerModel.exists({
              user: result.author._id,
              follower: authenticatedUser._id,
            })
          : Promise.resolve(false),
        authenticatedUser
          ? SavedPostModel.exists({
              userId: authenticatedUser._id,
              postId: result._id,
            })
          : Promise.resolve(false),
      ]);

    const post = {
      ...result,
      ...(authenticatedUser && {
        isLoggedInUserLiked: !!isUserLikedPost,
        author: {
          ...result.author,
          isLoggedInUserFollowing: !!isLoggedInUserFollowing,
        },
      }),
      ...(authenticatedUser && { isSavedPost: !!isSavedPost }),
    };

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
