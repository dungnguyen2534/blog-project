import { QuickSearchQuery } from "../validation/request/search.request";
import ArticleModel from "../models/article.model";
import UserModel from "../models/user.model";
import TagModel from "../models/tag.model";
import createHttpError from "http-errors";
import { BAD_REQUEST } from "../constant/httpCode";

export const quickSearchHandler = async (requestQuery: QuickSearchQuery) => {
  const { searchQuery } = requestQuery;
  if (searchQuery.trim() === "") {
    throw createHttpError(BAD_REQUEST, "No search query provided");
  }

  const limit = 6;
  const regex = { $regex: searchQuery, $options: "i" };

  const articles = await ArticleModel.find({
    title: regex,
  })
    .sort({ _id: -1 })
    .select("-images -body")
    .populate("author")
    .limit(limit);

  const users = await UserModel.find({
    username: regex,
  })
    .sort({ _id: -1 })
    .select("-password -email -githubId -googleId")
    .limit(limit);

  const tags = await TagModel.find({
    tagName: regex,
  })
    .sort({ _id: -1 })
    .limit(limit);

  return { articles, users, tags };
};
