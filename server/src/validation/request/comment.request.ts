import { z } from "zod";
import { MongoIdSchema } from "../utils";

export const createCommentParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const editCommentParamsSchema = z.object({
  commentId: MongoIdSchema,
});

export const deleteCommentParamsSchema = z.object({
  commentId: MongoIdSchema,
});

export const getCommentListParamsSchema = z.object({
  articleId: MongoIdSchema,
});

export const getCommentListQuerySchema = z.object({
  parentCommentId: MongoIdSchema.optional(),
  continueAfterId: MongoIdSchema.optional(),
  limit: z.string().optional(),
});

export type CreateCommentParams = z.infer<typeof createCommentParamsSchema>;
export type CreateCommentQuery = z.infer<typeof createCommentParamsSchema>;
export type EditCommentParams = z.infer<typeof editCommentParamsSchema>;
export type DeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>;
export type GetCommentListParams = z.infer<typeof getCommentListParamsSchema>;
export type GetCommentListQuery = z.infer<typeof getCommentListQuerySchema>;
