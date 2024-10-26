import { z } from "zod";
import { userSchema } from "./user";

export const ArticleSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  summary: z.string(),
  author: userSchema,
  tags: z.array(z.string()),
  images: z.array(z.string()),
  likeCount: z.number(),
  isLoggedInUserLiked: z.boolean().optional(),
  isSavedArticle: z.boolean().optional(),
  commentCount: z.number(),
  readingTime: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ArticleBodySchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().max(180).optional(),
  body: z.string().min(1),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()),
});

export const ArticlePageSchema = z.object({
  articles: z.array(ArticleSchema),
  lastArticleReached: z.boolean(),
});

export const CommentSchema = z.object({
  articleId: z.string(),
  _id: z.string(),
  author: userSchema,
  parentCommentId: z.string().optional(),
  body: z.string().min(1),
  images: z.array(z.string()),
  likeCount: z.number(),
  replyCount: z.number(),
  isLoggedInUserLiked: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CommentBodySchema = z.object({
  parentCommentId: z.string().optional(),
  body: z.string().min(1),
  images: z.array(z.string()),
});

export const commentPageSchema = z.object({
  comments: z.array(CommentSchema),
  lastCommentReached: z.boolean(),
  totalComments: z.number(),
});

export const commentStatusSchema = z.object({
  commentCount: z.number(),
  commentsWithStatus: z.array(
    z.object({
      _id: z.string(),
      likeCount: z.number(),
      isLoggedInUserLiked: z.boolean(),
    })
  ),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleBody = z.infer<typeof ArticleBodySchema>;
export type ArticlePage = z.infer<typeof ArticlePageSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CommentBody = z.infer<typeof CommentBodySchema>;
export type CommentPage = z.infer<typeof commentPageSchema>;
export type CommentStatus = z.infer<typeof commentStatusSchema>;
