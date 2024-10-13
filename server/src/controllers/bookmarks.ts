import { RequestHandler } from "express";
import UserModel from "../models/user";
import PostModel from "../models/post";
import createHttpError from "http-errors";
import assertIsDefined from "../utils/assertIsDefined";
import { savePostsParams } from "../validation/posts";

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

    const post = await PostModel.findById(postId).lean();
    if (!post) throw createHttpError(404, "Post not found");

    const updateResult = await UserModel.updateOne(
      { _id: authenticatedUser._id, savedPosts: { $ne: postId } },
      { $addToSet: { savedPosts: postId } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.sendStatus(204);
    }

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

    const updateResult = await UserModel.updateOne(
      { _id: authenticatedUser._id, savedPosts: postId },
      { $pull: { savedPosts: postId } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.sendStatus(204);
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
