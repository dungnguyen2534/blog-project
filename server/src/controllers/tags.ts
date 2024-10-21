import { RequestHandler } from "express";
import { TagParams, TagQuery } from "../validation/tags";
import assertIsDefined from "../utils/assertIsDefined";
import createHttpError from "http-errors";
import TagModel from "../models/tag";
import UserTagsModel from "../models/userTags";

export const followTag: RequestHandler<
  TagParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { tagName } = req.params;
  const authenticatedUser = req.user;

  const tagNameWithHash = "#" + tagName;
  try {
    assertIsDefined(authenticatedUser);

    const [existingFollower, existingTag] = await Promise.all([
      UserTagsModel.exists({
        user: authenticatedUser._id,
        followedTags: tagNameWithHash,
      }),
      TagModel.exists({ tagName: tagNameWithHash }),
    ]);

    if (!existingTag) {
      throw createHttpError(404, "Tag not found");
    }

    if (!existingFollower) {
      await Promise.all([
        UserTagsModel.updateOne(
          { user: authenticatedUser._id },
          { $push: { followedTags: tagNameWithHash } },
          { upsert: true }
        ),
        TagModel.updateOne(
          { tagName: tagNameWithHash },
          { $inc: { followerCount: 1 } }
        ),
      ]);

      const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
      res.status(201).json({ followerCount: tag?.followerCount });
    } else {
      const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
      res.status(204).json({ followerCount: tag?.followerCount });
    }
  } catch (error) {
    next(error);
  }
};

export const unFollowTag: RequestHandler<
  TagParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { tagName } = req.params;
  const authenticatedUser = req.user;

  const tagNameWithHash = "#" + tagName;
  try {
    assertIsDefined(authenticatedUser);

    const [existingFollower, existingTag] = await Promise.all([
      UserTagsModel.exists({
        user: authenticatedUser._id,
        followedTags: tagNameWithHash,
      }),
      TagModel.exists({ tagName: tagNameWithHash }),
    ]);

    if (!existingTag) {
      throw createHttpError(404, "Tag not found");
    }

    if (!existingFollower) {
      const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
      res.status(204).json({ followerCount: tag?.followerCount });
    } else {
      await Promise.all([
        UserTagsModel.updateOne({
          user: authenticatedUser._id,
          $pull: { followedTags: tagNameWithHash },
        }),
        TagModel.updateOne(
          { tagName: tagNameWithHash },
          { $inc: { followerCount: -1 } }
        ),
      ]);

      const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
      res.status(201).json({ followerCount: tag?.followerCount });
    }
  } catch (error) {
    next(error);
  }
};

export const getTagInfo: RequestHandler<
  TagParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { tagName } = req.params;
  const authenticatedUser = req.user;

  try {
    const tag = await TagModel.findOne({ tagName: "#" + tagName }).exec();

    if (!tag) {
      throw createHttpError(404, "Tag not found");
    }

    if (authenticatedUser) {
      const isLoggedInUserFollowing = await UserTagsModel.exists({
        user: authenticatedUser._id,
        followedTags: "#" + tagName,
      });

      res.status(200).json({ ...tag.toObject(), isLoggedInUserFollowing });
    } else {
      res.status(200).json(tag);
    }
  } catch (error) {
    next(error);
  }
};

export const getTags: RequestHandler<
  unknown,
  unknown,
  unknown,
  TagQuery
> = async (req, res, next) => {
  const limit = parseInt(req.query.limit || "12");
  const { continueAfterId } = req.query;
  const authenticatedUser = req.user;

  try {
    let query = TagModel.find().sort({ articleCount: -1 });

    if (continueAfterId) {
      query = query.lt("_id", continueAfterId);
    }

    const result = await query
      .limit(limit + 1)
      .lean()
      .exec();

    const tags = result.slice(0, limit);
    const lastTagReached = result.length <= limit;

    let tagsWithStatus;
    if (authenticatedUser) {
      const loggedInUserFollowingTags = await UserTagsModel.findOne({
        user: authenticatedUser._id,
      }).exec();

      tagsWithStatus = tags.forEach((tag) => {
        if (loggedInUserFollowingTags?.followedTags.includes(tag.tagName)) {
          return { ...tag, isLoggedInUserFollowing: true };
        }
      });
    }

    res
      .status(200)
      .json({ ...(authenticatedUser ? tagsWithStatus : tags), lastTagReached });
  } catch (error) {
    next(error);
  }
};
