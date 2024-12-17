import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  getBookmarkedArticleListHandler,
  bookmarkArticleHandler,
  unBookmarkArticleHandler,
} from "../services/bookmark.service";
import {
  getBookmarkArticleListQuerySchema,
  bookmarkArticleListParamsSchema,
  unBookmarkArticleListParamsSchema,
} from "../validation/request/articles.request";
import { OK } from "../constant/httpCode";

export const bookmarkArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = bookmarkArticleListParamsSchema.parse(req.params);

  await bookmarkArticleHandler(authenticatedUser, params);
  res.sendStatus(OK);
});

export const unBookmarkedArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = unBookmarkArticleListParamsSchema.parse(req.params);

  await unBookmarkArticleHandler(authenticatedUser, params);
  res.sendStatus(OK);
});

export const getBookmarkedArticleList = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const requestQuery = getBookmarkArticleListQuerySchema.parse(req.query);

  const savedArticleList = await getBookmarkedArticleListHandler(
    authenticatedUser,
    requestQuery
  );

  res.status(OK).json(savedArticleList);
});
