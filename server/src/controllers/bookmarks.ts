import { RequestHandler } from "express";
import PostModel from "../models/post";
import SavedPostModel from "../models/savedPost";
import assertIsDefined from "../utils/assertIsDefined";
import { getSavedPostsQuery, savePostsParams } from "../validation/posts";
import UserTagsModel from "../models/userTags";
import LikeModel from "../models/like";
import FollowerModel from "../models/follower";

export const savePost: RequestHandler<
  savePostsParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { postId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const existingSavedPost = await SavedPostModel.findOne({
      userId: authenticatedUser._id,
      postId: postId,
    });

    if (existingSavedPost) {
      return res.sendStatus(204);
    }

    const savedPost = new SavedPostModel({
      userId: authenticatedUser._id,
      postId: postId,
      tags: post.tags,
    });

    const savedTags = (
      await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
    )?.savedTags;

    const savedTagsSet = new Set(savedTags);
    const uniqueTags = post.tags.filter((tag) => !savedTagsSet.has(tag));

    if (uniqueTags.length > 0) {
      await UserTagsModel.updateOne(
        { user: authenticatedUser._id },
        { $push: { savedTags: { $each: uniqueTags } } },
        { upsert: true }
      );
    }

    await savedPost.save();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const unsavePost: RequestHandler<
  savePostsParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { postId } = req.params;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const deleteResult = await SavedPostModel.deleteOne({
      userId: authenticatedUser._id,
      postId: postId,
    });

    if (deleteResult.deletedCount === 0) {
      return res.sendStatus(204);
    }

    const savedTags = (
      await UserTagsModel.findOne({ user: authenticatedUser._id }).exec()
    )?.savedTags;

    const postTagsSet = new Set(post.tags);
    const remainingTags = savedTags?.filter((tag) => !postTagsSet.has(tag));

    await UserTagsModel.updateOne(
      { user: authenticatedUser._id },
      { $set: { savedTags: remainingTags } }
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

export const getSavedPosts: RequestHandler<
  unknown,
  unknown,
  unknown,
  getSavedPostsQuery
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const limit = parseInt(req.query.limit || "12");
  const { tag, continueAfterId } = req.query;

  try {
    assertIsDefined(authenticatedUser);

    let query = SavedPostModel.find({
      userId: authenticatedUser._id,
      ...(tag ? { tags: "#" + tag } : {}),
    }).sort({ postId: -1 });

    if (continueAfterId) {
      query = query.lt("postId", continueAfterId);
    }

    const savedPosts = await query
      .limit(limit + 1)
      .lean()
      .exec();

    const lastPostReached = savedPosts.length <= limit;

    const postIds = savedPosts
      .slice(0, limit)
      .map((savedPost) => savedPost.postId);

    const postList = await PostModel.find({ _id: { $in: postIds } })
      .sort({ _id: -1 })
      .populate("author")
      .lean()
      .exec();

    const postsWithStatus = await Promise.all(
      postList.map(async (post) => {
        const [
          isUserLikedPost,
          isLoggedInUserFollowing,
          likeCount,
          isSavedPost,
        ] = await Promise.all([
          LikeModel.exists({
            userId: authenticatedUser._id,
            targetType: "post",
            targetId: post._id,
          }),
          FollowerModel.exists({
            user: post.author._id,
            follower: authenticatedUser._id,
          }),
          LikeModel.countDocuments({
            targetId: post._id,
            targetType: "post",
          }),
          SavedPostModel.exists({
            userId: authenticatedUser._id,
            postId: post._id,
          }),
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
