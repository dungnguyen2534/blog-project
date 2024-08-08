import { RequestHandler } from "express";
import { slugify, shortid } from "../utils/slug-generator";
import { ObjectId } from "mongodb";
import PostModel from "../models/post";

interface PostBody {
  title: string;
  body: string;
}

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const allPosts = await PostModel.find().sort({ _id: -1 }).exec();
    res.status(200).json(allPosts);
  } catch (error) {
    next(error);
  }
};

export const createPost: RequestHandler<
  unknown,
  unknown,
  PostBody,
  unknown
> = async (req, res, next) => {
  const { title, body } = req.body;

  try {
    const _id = new ObjectId();
    const newPost = await PostModel.create({
      _id,
      slugId: shortid(_id),
      slug: slugify(title),
      title,
      body,
    });
    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};
