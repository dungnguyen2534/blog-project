import ArticleModel from "../models/article.model";
import SavedArticleModel from "../models/savedArticle.model";
import {
  GetBookmarkedArticleListQuery,
  BookmarkedArticleListParams,
  UnBookmarkArticleListParams,
} from "../validation/request/articles.request";
import UserTagsModel from "../models/userTags.model";
import LikeModel from "../models/like.model";
import FollowerModel from "../models/follower.model";
import createHttpError from "http-errors";
import { BAD_REQUEST, NOT_FOUND } from "../constant/httpCode";

export const saveArticleHandler = async (
  authenticatedUser: Express.User,
  params: BookmarkedArticleListParams
) => {
  const { articleId } = params;

  const article = await ArticleModel.findById(articleId);
  if (!article) {
    throw createHttpError(NOT_FOUND, "Article not found");
  }

  const existingSavedArticle = await SavedArticleModel.findOne({
    userId: authenticatedUser._id,
    articleId: articleId,
  });

  if (existingSavedArticle) {
    throw createHttpError(BAD_REQUEST, "Article already saved");
  }

  const savedArticle = new SavedArticleModel({
    userId: authenticatedUser._id,
    articleId: articleId,
    articleTitle: article.title,
    tags: article.tags,
  });

  const savedTags = (
    await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
  )?.savedTags;

  const savedTagsSet = new Set(savedTags);
  const uniqueTags = article.tags.filter((tag) => !savedTagsSet.has(tag));

  if (uniqueTags.length > 0) {
    await UserTagsModel.updateOne(
      { user: authenticatedUser._id },
      { $push: { savedTags: { $each: uniqueTags } } },
      { upsert: true }
    );
  }

  await savedArticle.save();
};

export const unSaveArticleHandler = async (
  authenticatedUser: Express.User,
  params: UnBookmarkArticleListParams
) => {
  const { articleId } = params;

  const article = await ArticleModel.findById(articleId);
  if (!article) {
    throw createHttpError(NOT_FOUND, "Article not found");
  }

  const deleteResult = await SavedArticleModel.deleteOne({
    userId: authenticatedUser._id,
    articleId: articleId,
  });

  if (deleteResult.deletedCount === 0) {
    throw createHttpError(BAD_REQUEST, "This is not a saved article");
  }

  const savedTags = (
    await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
  )?.savedTags;

  const remainingTags = await Promise.all(
    savedTags?.map(async (tag) => {
      const hasTag = await SavedArticleModel.exists({
        userId: authenticatedUser._id,
        tags: tag,
      });
      return hasTag ? tag : null;
    }) || []
  );

  const filteredTags = remainingTags.filter((tag) => tag !== null);

  await UserTagsModel.updateOne(
    { user: authenticatedUser._id },
    { $set: { savedTags: filteredTags } }
  );
};

export const getTagListInBookmarksHandler = async (
  authenticatedUser: Express.User
) => {
  const savedTags = (
    await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
  )?.savedTags;

  return { savedTags };
};

export const getBookmarkedArticleListHandler = async (
  authenticatedUser: Express.User,
  requestQuery: GetBookmarkedArticleListQuery
) => {
  const limit = parseInt(requestQuery.limit || "12");
  const { tag, continueAfterId, searchQuery } = requestQuery;

  let query = SavedArticleModel.find({
    userId: authenticatedUser._id,
    ...(tag && { tags: "#" + tag }),
    ...(searchQuery && {
      articleTitle: { $regex: searchQuery, $options: "i" },
    }),
  })
    .sort({ articleId: -1 })
    .select("-images");

  if (continueAfterId) {
    query = query.lt("articleId", continueAfterId);
  }

  const savedArticles = await query
    .limit(limit + 1)
    .lean()
    .exec();

  const lastArticleReached = savedArticles.length <= limit;

  const articleIds = savedArticles
    .slice(0, limit)
    .map((savedArticle) => savedArticle.articleId);

  const articleList = await ArticleModel.find({ _id: { $in: articleIds } })
    .sort({ _id: -1 })
    .populate("author")
    .lean()
    .exec();

  const articlesWithStatus = await Promise.all(
    articleList.map(async (article) => {
      const [
        isUserLikedArticle,
        isLoggedInUserFollowing,
        likeCount,
        isSavedArticle,
      ] = await Promise.all([
        LikeModel.exists({
          userId: authenticatedUser._id,
          targetType: "article",
          targetId: article._id,
        }),
        FollowerModel.exists({
          user: article.author._id,
          follower: authenticatedUser._id,
        }),
        LikeModel.countDocuments({
          targetId: article._id,
          targetType: "article",
        }),
        SavedArticleModel.exists({
          userId: authenticatedUser._id,
          articleId: article._id,
        }),
      ]);

      const readingTime = Math.ceil(article.body.split(/\s+/).length / 238);
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
