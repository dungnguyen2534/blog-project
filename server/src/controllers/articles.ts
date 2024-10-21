import { RequestHandler } from "express";
import { slugify } from "../utils/slugify";
import ArticleModel from "../models/article";
import TempImageModel from "../models/tempImage";
import {
  createArticleBody,
  deleteArticleParams,
  getArticlesQuery,
  getTopArticlesParams,
  getTopArticlesQuery,
  UpdateArticleBody,
  updateArticleParams,
} from "../validation/articles";
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
import SavedArticleModel from "../models/savedArticle";

export const createArticle: RequestHandler<
  unknown,
  unknown,
  createArticleBody,
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

    // delete unused images if there is any(when user article an image and change/delete before article)
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
      const lowercaseTags = tags.map((tag) => tag.toLowerCase());
      const tagPromises = lowercaseTags.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { articleCount: 1 } }
          );
        } else {
          await TagModel.create({ tagName: tag, articleCount: 1 });
        }
      });

      await Promise.all(tagPromises);
    }

    const [newArticle] = await Promise.all([
      ArticleModel.create({
        slug: slugify(title),
        title,
        body,
        tags,
        images: imagePaths,
        summary,
        author: authenticatedUser._id,
      }),
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalArticles: 1 },
      }),
    ]);

    res.status(201).json(newArticle);
  } catch (error) {
    next(error);
  }
};

export const updateArticle: RequestHandler<
  updateArticleParams,
  unknown,
  UpdateArticleBody,
  unknown
> = async (req, res, next) => {
  const { articleId } = req.params;
  const { title, body, summary, tags, images } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const articleToUpdate = await ArticleModel.findById(articleId).exec();
    if (!articleToUpdate) throw createHttpError(404, "Article not found");

    if (!authenticatedUser._id.equals(articleToUpdate.author._id)) {
      throw createHttpError(
        403,
        "You are not authorized to update this article"
      );
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

      const oldUnusedImages = articleToUpdate.images.filter(
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

    // delete new unused images if there is any(when user article an image and change/delete before article)
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
      const tagsToAdd = tags.filter(
        (tag) => !articleToUpdate.tags.includes(tag)
      );
      const tagsToRemove = articleToUpdate.tags.filter(
        (tag) => !tags.includes(tag)
      );

      const addTagPromises = tagsToAdd.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { articleCount: 1 } }
          );
        } else {
          await TagModel.create({ tagName: tag, articleCount: 1 });
        }
      });

      const removeTagPromises = tagsToRemove.map(async (tag) => {
        const tagExists = await TagModel.exists({ tagName: tag });
        if (tagExists) {
          await TagModel.updateOne(
            { tagName: tag },
            { $inc: { articleCount: -1 } }
          );
        }
      });

      await Promise.all([...addTagPromises, ...removeTagPromises]);
    }

    if (articleToUpdate.title !== title) {
      await SavedArticleModel.updateMany(
        { articleId: articleToUpdate._id },
        { articleTitle: title }
      );
    }

    Object.assign(articleToUpdate, {
      slug: slugify(title),
      title,
      body,
      ...(tags && { tags }),
      ...(newImages && { images: newImages }),
      summary,
    });

    await articleToUpdate.save();
    res.status(200).json(articleToUpdate);
  } catch (error) {
    next(error);
  }
};

export const deleteArticle: RequestHandler<
  deleteArticleParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { articleId } = req.params;

  try {
    assertIsDefined(authenticatedUser);

    const articleToDelete = await ArticleModel.findById(articleId).exec();
    if (!articleToDelete) throw createHttpError(404, "Article not found");

    if (!authenticatedUser._id.equals(articleToDelete.author._id)) {
      throw createHttpError(
        403,
        "You are not authorized to delete this article"
      );
    }

    const deletePromises = articleToDelete.images.map(async (imagePath) => {
      const imagePathToDelete = path.join(__dirname, "../..", imagePath);
      return fs.promises.unlink(imagePathToDelete).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    });

    await Promise.all(deletePromises);

    // cascade delete comments of the article
    const comments = await CommentModel.find({
      articleId: articleToDelete._id,
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
      await CommentModel.deleteMany({ articleId: articleToDelete._id });
    }

    if (articleToDelete.tags && articleToDelete.tags.length > 0) {
      const tagPromises = articleToDelete.tags.map(async (tag) => {
        const existingTag = await TagModel.findOne({ tagName: tag });
        if (existingTag) {
          if (
            existingTag.articleCount === 1 &&
            existingTag.followerCount === 0
          ) {
            await existingTag.deleteOne();
          } else {
            await TagModel.updateOne(
              { tagName: tag },
              { $inc: { articleCount: -1 } }
            );
          }
        }
      });

      await Promise.all(tagPromises);
    }

    await Promise.all([
      LikeModel.deleteMany({
        targetId: articleToDelete._id,
        targetType: "article",
      }),
      UserModel.findByIdAndUpdate(authenticatedUser._id, {
        $inc: { totalArticles: -1 },
      }),
      articleToDelete.deleteOne(),
    ]);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getArticleList: RequestHandler<
  unknown,
  unknown,
  unknown,
  getArticlesQuery
> = async (req, res, next) => {
  const limit = parseInt(req.query.limit || "12");
  const { authorId, tag, continueAfterId, followedTarget } = req.query;
  const authenticatedUser = req.user;

  const filter = {
    ...(authorId ? { author: authorId } : {}),
    ...(tag ? { tags: "#" + tag } : {}),
  };

  try {
    let query = ArticleModel.find(filter).sort({ _id: -1 });

    if (followedTarget) {
      assertIsDefined(authenticatedUser);

      if (followedTarget === "users") {
        const following = await FollowerModel.find({
          follower: authenticatedUser._id,
        }).exec();

        const followingUserIds = following.map((f) => f.user);
        query = ArticleModel.find({
          author: { $in: followingUserIds },
        }).sort({ _id: -1 });
      } else if (followedTarget === "tags") {
        const userTagsInfo = await userTagsModel
          .findOne({ user: authenticatedUser._id })
          .exec();

        const followedTags = userTagsInfo?.followedTags;
        query = ArticleModel.find({
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

        query = ArticleModel.find({
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

    const articleList = result.slice(0, limit);
    const lastArticleReached = result.length <= limit;

    const articlesWithStatus = await Promise.all(
      articleList.map(async (article) => {
        const [
          isUserLikedArticle,
          isLoggedInUserFollowing,
          likeCount,
          isSavedArticle,
        ] = await Promise.all([
          authenticatedUser
            ? LikeModel.exists({
                userId: authenticatedUser._id,
                targetType: "article",
                targetId: article._id,
              })
            : Promise.resolve(false),
          authenticatedUser
            ? FollowerModel.exists({
                user: article.author._id,
                follower: authenticatedUser._id,
              })
            : Promise.resolve(false),
          LikeModel.countDocuments({
            targetId: article._id,
            targetType: "article",
          }),
          authenticatedUser
            ? SavedArticleModel.exists({
                userId: authenticatedUser._id,
                articleId: article._id,
              })
            : Promise.resolve(false),
        ]);

        return {
          ...article,
          likeCount,
          ...(authenticatedUser && {
            isLoggedInUserLiked: !!isUserLikedArticle,
            author: {
              ...article.author,
              isLoggedInUserFollowing: !!isLoggedInUserFollowing,
            },
          }),
          ...(authenticatedUser && { isSavedArticle: !!isSavedArticle }),
        };
      })
    );

    res.status(200).json({ articles: articlesWithStatus, lastArticleReached });
  } catch (error) {
    next(error);
  }
};

export const getTopArticles: RequestHandler<
  getTopArticlesParams,
  unknown,
  unknown,
  getTopArticlesQuery
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
    const query = ArticleModel.find(filter).sort({
      likeCount: -1,
      createdAt: -1,
    });

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

    const articleList = result.slice(0, limit);
    const lastArticleReached = result.length <= limit;

    const articlesWithStatus = await Promise.all(
      articleList.map(async (article) => {
        const [
          isUserLikedArticle,
          isLoggedInUserFollowing,
          likeCount,
          isSavedArticle,
        ] = await Promise.all([
          authenticatedUser
            ? LikeModel.exists({
                userId: authenticatedUser._id,
                targetType: "article",
                targetId: article._id,
              })
            : Promise.resolve(false),
          authenticatedUser
            ? FollowerModel.exists({
                user: article.author._id,
                follower: authenticatedUser._id,
              })
            : Promise.resolve(false),
          LikeModel.countDocuments({
            targetId: article._id,
            targetType: "article",
          }),
          authenticatedUser
            ? SavedArticleModel.exists({
                userId: authenticatedUser._id,
                articleId: article._id,
              })
            : Promise.resolve(false),
        ]);

        return {
          ...article,
          likeCount,
          ...(authenticatedUser && {
            isLoggedInUserLiked: !!isUserLikedArticle,
            author: {
              ...article.author,
              isLoggedInUserFollowing: !!isLoggedInUserFollowing,
            },
          }),
          ...(authenticatedUser && { isSavedArticle: !!isSavedArticle }),
        };
      })
    );

    res.status(200).json({ articles: articlesWithStatus, lastArticleReached });
  } catch (error) {
    next(error);
  }
};

export const getArticle: RequestHandler = async (req, res, next) => {
  const { slug } = req.params;
  const authenticatedUser = req.user;

  try {
    const result = await ArticleModel.findOne({ slug })
      .populate("author")
      .lean()
      .exec();
    if (!result) throw createHttpError(404, "Article not found");

    const [isUserLikedArticle, isLoggedInUserFollowing, isSavedArticle] =
      await Promise.all([
        authenticatedUser
          ? LikeModel.exists({
              userId: authenticatedUser._id,
              targetType: "article",
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
          ? SavedArticleModel.exists({
              userId: authenticatedUser._id,
              articleId: result._id,
            })
          : Promise.resolve(false),
      ]);

    const article = {
      ...result,
      ...(authenticatedUser && {
        isLoggedInUserLiked: !!isUserLikedArticle,
        author: {
          ...result.author,
          isLoggedInUserFollowing: !!isLoggedInUserFollowing,
        },
      }),
      ...(authenticatedUser && { isSavedArticle: !!isSavedArticle }),
    };

    res.status(200).json(article);
  } catch (error) {
    next(error);
  }
};

export const getSlugs: RequestHandler = async (req, res, next) => {
  try {
    const result = await ArticleModel.find().select("slug").exec();
    const slugs = result.map((article) => article.slug);

    res.status(200).json(slugs);
  } catch (error) {
    next(error);
  }
};

export const uploadInArticleImages: RequestHandler = async (req, res, next) => {
  const image = req.file;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);
    assertIsDefined(image);

    const fileName = nanoid();
    const imagePath =
      "/uploads/in-article-images/" +
      fileName +
      path.extname(image.originalname);

    await sharp(image.buffer)
      .resize(1920, undefined, { withoutEnlargement: true })
      .toFile("./" + imagePath);

    // create a temporary image document to compare and delete unused image when create article
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
