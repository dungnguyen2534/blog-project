import { RequestHandler } from "express";
import ArticleModel from "../models/article";
import SavedArticleModel from "../models/savedArticle";
import assertIsDefined from "../utils/assertIsDefined";
import {
  getSavedArticlesQuery,
  saveArticlesParams,
} from "../validation/articles";
import UserTagsModel from "../models/userTags";
import LikeModel from "../models/like";
import FollowerModel from "../models/follower";

export const saveArticle: RequestHandler<
  saveArticlesParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { articleId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const article = await ArticleModel.findById(articleId);
    if (!article) {
      return res.status(404).send("Article not found");
    }

    const existingSavedArticle = await SavedArticleModel.findOne({
      userId: authenticatedUser._id,
      articleId: articleId,
    });

    if (existingSavedArticle) {
      return res.sendStatus(204);
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
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const unsaveArticle: RequestHandler<
  saveArticlesParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { articleId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const article = await ArticleModel.findById(articleId);
    if (!article) {
      return res.status(404).send("Article not found");
    }

    const deleteResult = await SavedArticleModel.deleteOne({
      userId: authenticatedUser._id,
      articleId: articleId,
    });

    if (deleteResult.deletedCount === 0) {
      return res.sendStatus(204);
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

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const getSavedTags: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);
    const savedTags = (
      await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
    )?.savedTags;

    res.status(200).json(savedTags);
  } catch (error) {
    next(error);
  }
};

export const getSavedArticles: RequestHandler<
  unknown,
  unknown,
  unknown,
  getSavedArticlesQuery
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const limit = parseInt(req.query.limit || "12");
  const { tag, continueAfterId, searchQuery } = req.query;

  try {
    assertIsDefined(authenticatedUser);

    let query = SavedArticleModel.find({
      userId: authenticatedUser._id,
      ...(tag && { tags: "#" + tag }),
      ...(searchQuery && {
        articleTitle: { $regex: searchQuery, $options: "i" },
      }),
    }).sort({ articleId: -1 });

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
