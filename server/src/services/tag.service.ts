import { TagParams, TagQuery } from "../validation/request/tag.request";
import createHttpError from "http-errors";
import TagModel from "../models/tag.model";
import UserTagsModel from "../models/userFollowedTag.model";
import { CREATED, NOT_FOUND, OK } from "../constant/httpCode";

export const followTagHandler = async (
  authenticatedUser: Express.User,
  params: TagParams
) => {
  const { tagName } = params;
  const tagNameWithHash = "#" + tagName;

  const [existingFollower, existingTag] = await Promise.all([
    UserTagsModel.exists({
      user: authenticatedUser._id,
      followedTags: tagNameWithHash,
    }),
    TagModel.exists({ tagName: tagNameWithHash }),
  ]);

  if (!existingTag) {
    throw createHttpError(NOT_FOUND, "Tag not found");
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
    return { statusCode: CREATED, followerCount: tag?.followerCount };
  } else {
    const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
    return { statusCode: OK, followerCount: tag?.followerCount };
  }
};

export const unFollowTagHandler = async (
  authenticatedUser: Express.User,
  params: TagParams
) => {
  const { tagName } = params;
  const tagNameWithHash = "#" + tagName;

  const [existingFollower, existingTag] = await Promise.all([
    UserTagsModel.exists({
      user: authenticatedUser._id,
      followedTags: tagNameWithHash,
    }),
    TagModel.findOne({ tagName: tagNameWithHash }),
  ]);

  if (!existingTag) {
    throw createHttpError(NOT_FOUND, "Tag not found");
  }

  const deleteTagCondition =
    existingTag.followerCount === 1 && existingTag.articleCount === 0;

  if (!existingFollower) {
    const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
    return { statusCode: OK, followerCount: tag?.followerCount };
  } else {
    await Promise.all([
      UserTagsModel.updateOne({
        user: authenticatedUser._id,
        $pull: { followedTags: tagNameWithHash },
      }),
      deleteTagCondition
        ? TagModel.deleteOne({ tagName: tagNameWithHash })
        : TagModel.updateOne(
            { tagName: tagNameWithHash },
            { $inc: { followerCount: -1 } }
          ),
    ]);

    const tag = await TagModel.findOne({ tagName: tagNameWithHash }).exec();
    return { statusCode: CREATED, followerCount: tag?.followerCount };
  }
};

export const getTagInfoHandler = async (
  authenticatedUser: Express.User | undefined,
  params: TagParams
) => {
  const { tagName } = params;
  const tag = await TagModel.findOne({ tagName: "#" + tagName }).exec();

  if (!tag) {
    throw createHttpError(NOT_FOUND, "Tag not found");
  }

  if (authenticatedUser) {
    const isLoggedInUserFollowing = await UserTagsModel.exists({
      user: authenticatedUser._id,
      followedTags: "#" + tagName,
    });

    return {
      statusCode: OK,
      tag: {
        ...tag.toObject(),
        isLoggedInUserFollowing: !!isLoggedInUserFollowing,
      },
    };
  } else {
    return { statusCode: OK, tag };
  }
};

export const getTagListHandler = async (
  authenticatedUser: Express.User | undefined,
  requestQuery: TagQuery
) => {
  const limit = parseInt(requestQuery.limit || "12");
  const { continueAfterId } = requestQuery;

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

  return {
    tagList: {
      ...(authenticatedUser ? tagsWithStatus : tags),
      lastTagReached,
    },
  };
};
