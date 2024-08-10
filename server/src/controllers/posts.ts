import { RequestHandler } from "express";
import { slugify, shortid } from "../utils/slug-generator";
import { ObjectId } from "mongodb";
import PostModel from "../models/post";
import { PostBody } from "../validation/posts";
import createHttpError from "http-errors";
import assertIsDefined from "../utils/assertIsDefined";

export const createPost: RequestHandler<
  unknown,
  unknown,
  PostBody,
  unknown
> = async (req, res, next) => {
  const { title, summary, body } = req.body;
  const authenticatedUser = req.user;

  try {
    assertIsDefined(authenticatedUser);

    const _id = new ObjectId();
    const newPost = await PostModel.create({
      _id,
      slugId: shortid(_id),
      slug: slugify(title),
      title,
      summary,
      body,
      author: authenticatedUser._id,
    });
    res.status(201).json(newPost);
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
    const result = await PostModel.find().select("+slugId +slug").exec();

    const slugs = result.map((slug) => slug.slug + "-" + slug.slugId);
    res.status(200).json(slugs);
  } catch (error) {
    next(error);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const { slugId } = req.params;

  try {
    const post = await PostModel.findOne({ slugId }).populate("author").exec();

    if (!post) throw createHttpError(404, "Post not found");

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
