import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  getBookmarkedArticleListHandler,
  getTagListInBookmarksHandler,
  saveArticleHandler,
  unSaveArticleHandler,
} from "../services/bookmark.service";
import {
  getSavedArticleListQuerySchema,
  saveArticleListParamsSchema,
  unSaveArticleListParamsSchema,
} from "../validation/request/articles.request";
import { OK } from "../constant/httpCode";

export const bookmarkArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = saveArticleListParamsSchema.parse(req.params);

  await saveArticleHandler(authenticatedUser, params);
  res.sendStatus(OK);
});

export const unBookmarkedArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = unSaveArticleListParamsSchema.parse(req.params);

  await unSaveArticleHandler(authenticatedUser, params);
  res.sendStatus(OK);
});

export const getTagListInBookmarks = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const { savedTags } = await getTagListInBookmarksHandler(authenticatedUser);
  res.status(OK).json(savedTags);
});

export const getBookmarkedArticleList = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const requestQuery = getSavedArticleListQuerySchema.parse(req.query);

  const savedArticleList = await getBookmarkedArticleListHandler(
    authenticatedUser,
    requestQuery
  );

  res.status(OK).json(savedArticleList);
});
