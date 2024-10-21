import { z } from "zod";
import { ImageSchema, MongoIdSchema, ArticleBodySchema } from "./utils";

export const createArticleSchema = z.object({
  body: ArticleBodySchema,
});

export const updateArticleSchema = z.object({
  params: z.object({
    articleId: MongoIdSchema,
  }),
  body: ArticleBodySchema,
});

export const deleteArticleSchema = z.object({
  params: z.object({
    articleId: MongoIdSchema,
  }),
});

export const getArticlesSchema = z.object({
  query: z.object({
    authorId: MongoIdSchema.optional(),
    continueAfterId: MongoIdSchema.optional(),
    tag: z.string().optional(),
    limit: z.string().optional(),
    followedTarget: z.string().optional(),
  }),
});

export const getTopArticlesSchema = z.object({
  params: z.object({
    timeSpan: z.string(),
  }),
  query: z.object({
    limit: z.string().optional(),
    continueAfterLikeCount: z.string().optional(),
    continueAfterId: MongoIdSchema.optional(),
  }),
});

export const getSavedArticlesSchema = z.object({
  query: z.object({
    tag: z.string().optional(),
    limit: z.string().optional(),
    continueAfterId: MongoIdSchema.optional(),
    searchQuery: z.string().optional(),
  }),
});

export const saveArticlesSchema = z.object({
  params: z.object({
    articleId: MongoIdSchema,
  }),
});

export const InArticleImageSchema = z.object({
  file: ImageSchema,
});

export type updateArticleParams = z.infer<typeof updateArticleSchema>["params"];
export type UpdateArticleBody = z.infer<typeof updateArticleSchema>["body"];
export type createArticleBody = z.infer<typeof ArticleBodySchema>;
export type deleteArticleParams = z.infer<typeof deleteArticleSchema>["params"];
export type getArticlesQuery = z.infer<typeof getArticlesSchema>["query"];
export type saveArticlesParams = z.infer<typeof saveArticlesSchema>["params"];
export type getTopArticlesParams = z.infer<
  typeof getTopArticlesSchema
>["params"];
export type getTopArticlesQuery = z.infer<typeof getTopArticlesSchema>["query"];
export type getSavedArticlesQuery = z.infer<
  typeof getSavedArticlesSchema
>["query"];
