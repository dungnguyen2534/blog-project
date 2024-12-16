import { z } from "zod";
import { MongoIdSchema } from "../utils";

export const updateArticleParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const deleteArticleParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const getArticleParamsSchema = z.object({
  slug: z.string(),
});

export const getArticleListQuerySchema = z.object({
  authorId: MongoIdSchema.optional(),
  continueAfterId: MongoIdSchema.optional(),
  tag: z.string().optional(),
  limit: z.string().optional(),
  followedTarget: z.string().optional(),
});

export const getTopArticlesParamsSchema = z.object({
  timeSpan: z.string(),
});

export const getTopArticlesQuerySchema = z.object({
  limit: z.string().optional(),
  continueAfterLikeCount: z.string().optional(),
  continueAfterId: MongoIdSchema.optional(),
});

export const bookmarkArticleListParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const unBookmarkArticleListParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const getBookmarkArticleListQuerySchema = z.object({
  tag: z.string().optional(),
  limit: z.string().optional(),
  continueAfterId: MongoIdSchema.optional(),
  searchQuery: z.string().optional(),
});

export type GetArticleParams = z.infer<typeof getArticleParamsSchema>;
export type UpdateArticleParams = z.infer<typeof updateArticleParamsSchema>;
export type DeleteArticleParams = z.infer<typeof deleteArticleParamsSchema>;
export type GetArticleListQuery = z.infer<typeof getArticleListQuerySchema>;
export type GetTopArticleListParams = z.infer<
  typeof getTopArticlesParamsSchema
>;
export type GetTopArticleListQuery = z.infer<typeof getTopArticlesQuerySchema>;
export type BookmarkedArticleListParams = z.infer<
  typeof bookmarkArticleListParamsSchema
>;
export type UnBookmarkArticleListParams = z.infer<
  typeof unBookmarkArticleListParamsSchema
>;
export type GetBookmarkedArticleListQuery = z.infer<
  typeof getBookmarkArticleListQuerySchema
>;
