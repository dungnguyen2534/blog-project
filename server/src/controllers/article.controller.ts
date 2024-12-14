import {
  deleteArticleParamsSchema,
  getArticleListQuerySchema,
  getArticleParamsSchema,
  getTopArticlesParamsSchema,
  getTopArticlesQuerySchema,
  updateArticleParamsSchema,
} from "../validation/request/articles.request";
import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  createArticleHandler,
  deleteArticleHandler,
  getArticleHandler,
  getArticleListHandler,
  getSlugsHandler,
  getTopArticleListHandler,
  updateArticleHandler,
  uploadInArticleImageHandler,
} from "../services/article.service";
import { articleBodySchema, imageSchema } from "../validation/utils";
import { CREATED, OK } from "../constant/httpCode";

export const createArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const articleData = articleBodySchema.parse(req.body);

  const { newArticle } = await createArticleHandler(
    authenticatedUser,
    articleData
  );

  res.status(CREATED).json(newArticle);
});

export const updateArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = updateArticleParamsSchema.parse(req.params);
  const articleData = articleBodySchema.parse(req.body);

  const { updatedArticle } = await updateArticleHandler(
    authenticatedUser,
    params,
    articleData
  );

  res.status(OK).json(updatedArticle);
});

export const deleteArticle = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = deleteArticleParamsSchema.parse(req.params);

  await deleteArticleHandler(authenticatedUser, params);
  res.sendStatus(OK);
});

export const getArticleList = catchErrors(async (req, res) => {
  const requestQuery = getArticleListQuerySchema.parse(req.query);
  const authenticatedUser = req.user;

  const articleList = await getArticleListHandler(
    authenticatedUser,
    requestQuery
  );

  res.status(OK).json(articleList);
});

export const getTopArticleList = catchErrors(async (req, res) => {
  const params = getTopArticlesParamsSchema.parse(req.params);
  const requestQuery = getTopArticlesQuerySchema.parse(req.query);
  const authenticatedUser = req.user;

  const TopArticles = await getTopArticleListHandler(
    authenticatedUser,
    params,
    requestQuery
  );

  res.status(OK).json(TopArticles);
});

export const getArticle = catchErrors(async (req, res) => {
  const params = getArticleParamsSchema.parse(req.params);
  const authenticatedUser = req.user;

  const { article } = await getArticleHandler(authenticatedUser, params);
  res.status(OK).json(article);
});

export const getSlugs = catchErrors(async (_, res) => {
  const { slugs } = await getSlugsHandler();
  res.status(OK).json(slugs);
});

export const uploadInArticleImage = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const image = await imageSchema.parseAsync(req.file);
  const { imageUrl } = await uploadInArticleImageHandler(
    authenticatedUser,
    image
  );

  res.status(CREATED).json({ imageUrl });
});
