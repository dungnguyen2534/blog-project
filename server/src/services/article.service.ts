import ArticleModel from "../models/article.model";
import TempImageModel from "../models/tempImage.model";
import {
  DeleteArticleParams,
  GetArticleListQuery,
  GetArticleParams,
  GetTopArticleListParams,
  GetTopArticleListQuery,
  UpdateArticleParams,
} from "../validation/request/articles.request";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import sharp from "sharp";
import env from "../constant/env";
import path from "path";
import fs from "fs";
import CommentModel from "../models/comment.model";
import LikeModel from "../models/like.model";
import UserModel from "../models/user.model";
import FollowerModel from "../models/follower.model";
import TagModel from "../models/tag.model";
import userTagsModel from "../models/userTags.model";
import SavedArticleModel from "../models/savedArticle.model";
import { slugify } from "../utils/slugify";
import assertIsDefined from "../utils/assertIsDefined";
import calculateReadingTime from "../utils/calculateReadingTime";
import { ArticleBody, CustomImageType } from "../validation/utils";
import getTopArticleListDateFilter from "../utils/getTopArticleListDate";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from "../constant/httpCode";

export const createArticleHandler = async (
  authenticatedUser: Express.User,
  data: ArticleBody
) => {
  const { title, body, summary, tags, images } = data;

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
    await TempImageModel.deleteMany({
      imagePath: { $in: unusedImagePaths },
    });
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

  return { newArticle };
};

export const updateArticleHandler = async (
  authenticatedUser: Express.User,
  params: UpdateArticleParams,
  data: ArticleBody
) => {
  const { articleId } = params;
  const { title, body, summary, tags, images } = data;

  const articleToUpdate = await ArticleModel.findById(articleId).exec();
  if (!articleToUpdate) throw createHttpError(NOT_FOUND, "Article not found");

  if (!authenticatedUser._id.equals(articleToUpdate.author._id)) {
    throw createHttpError(
      FORBIDDEN,
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
    const tagsToAdd = tags.filter((tag) => !articleToUpdate.tags.includes(tag));
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
    slug: articleToUpdate.slug,
    title,
    body,
    ...(tags && { tags }),
    ...(newImages && { images: newImages }),
    summary,
  });

  await articleToUpdate.save();

  return { updatedArticle: articleToUpdate };
};

export const deleteArticleHandler = async (
  authenticatedUser: Express.User,
  params: DeleteArticleParams
) => {
  const { articleId } = params;

  const articleToDelete = await ArticleModel.findById(articleId).exec();
  if (!articleToDelete) throw createHttpError(NOT_FOUND, "Article not found");

  if (!authenticatedUser._id.equals(articleToDelete.author._id)) {
    throw createHttpError(
      FORBIDDEN,
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
        if (existingTag.articleCount === 1 && existingTag.followerCount === 0) {
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
};

export const getArticleListHandler = async (
  authenticatedUser: Express.User | undefined,
  requestQuery: GetArticleListQuery
) => {
  const { authorId, tag, continueAfterId, followedTarget } = requestQuery;
  const limit = parseInt(requestQuery.limit || "12");

  const filter = {
    ...(authorId ? { author: authorId } : {}),
    ...(tag ? { tags: "#" + tag } : {}),
  };

  let query = ArticleModel.find(filter).sort({ _id: -1 }).select("-images");

  // get the article list of user/tag the authenticatedUser user followed
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
      const [isUserLikedArticle, isLoggedInUserFollowing, isSavedArticle] =
        await Promise.all([
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
          authenticatedUser
            ? SavedArticleModel.exists({
                userId: authenticatedUser._id,
                articleId: article._id,
              })
            : Promise.resolve(false),
        ]);

      const readingTime = calculateReadingTime(article.body);
      const articleToSent = { ...article, body: "" }; // reduce response size since the list doesn't need body
      return {
        ...articleToSent,
        ...(authenticatedUser && {
          isLoggedInUserLiked: !!isUserLikedArticle,
          author: {
            ...article.author,
            isLoggedInUserFollowing: !!isLoggedInUserFollowing,
          },
        }),
        ...(authenticatedUser && { isSavedArticle: !!isSavedArticle }),
        readingTime,
      };
    })
  );

  return { articles: articlesWithStatus, lastArticleReached };
};

export const getTopArticleListHandler = async (
  authenticatedUser: Express.User | undefined,
  params: GetTopArticleListParams,
  requestQuery: GetTopArticleListQuery
) => {
  const { timeSpan } = params;
  const endDate = getTopArticleListDateFilter(timeSpan);
  if (!endDate) throw createHttpError(BAD_REQUEST, "Invalid time span");

  const limit = parseInt(requestQuery.limit || "12");
  const { continueAfterLikeCount, continueAfterId } = requestQuery;

  const filter = {
    createdAt: { $gte: endDate },
  };

  let query = ArticleModel.find(filter)
    .sort({
      likeCount: -1,
      createdAt: -1,
    })
    .select("-images");

  if (continueAfterLikeCount && continueAfterId) {
    query = ArticleModel.find({
      ...filter,
      $or: [
        { likeCount: { $lt: continueAfterLikeCount } },
        {
          likeCount: continueAfterLikeCount,
          _id: { $lt: continueAfterId },
        },
      ],
    }).sort({
      likeCount: -1,
      createdAt: -1,
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

      const readingTime = calculateReadingTime(article.body);
      const articleToSent = { ...article, body: "" };

      return {
        ...articleToSent,
        likeCount,
        ...(authenticatedUser && {
          isLoggedInUserLiked: !!isUserLikedArticle,
          author: {
            ...article.author,
            isLoggedInUserFollowing: !!isLoggedInUserFollowing,
          },
        }),
        ...(authenticatedUser && { isSavedArticle: !!isSavedArticle }),
        readingTime,
      };
    })
  );

  return { articles: articlesWithStatus, lastArticleReached };
};

export const getArticleHandler = async (
  authenticatedUser: Express.User | undefined,
  params: GetArticleParams
) => {
  const { slug } = params;

  const result = await ArticleModel.findOne({ slug })
    .populate("author")
    .lean()
    .exec();
  if (!result) throw createHttpError(NOT_FOUND, "Article not found");

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

  return { article };
};

export const getSlugsHandler = async () => {
  const result = await ArticleModel.find().select("slug").lean().exec();
  const slugs = result.map((article) => article.slug);

  return { slugs };
};

export const uploadInArticleImageHandler = async (
  authenticatedUser: Express.User,
  image: CustomImageType
) => {
  const { width, height } = await sharp(image.buffer).metadata();

  const fileName = nanoid();
  const imagePath = `/uploads/in-article-images/${fileName}_width=${width}_height=${height}.webp`;

  await sharp(image.buffer)
    .resize(1920, undefined, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(`./${imagePath}`);

  await TempImageModel.create({
    imagePath,
    userId: authenticatedUser._id,
    temporary: true,
  });

  const imageUrl = env.SERVER_URL + imagePath;
  return { imageUrl };
};
