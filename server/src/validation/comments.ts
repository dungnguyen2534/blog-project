import { z } from "zod";
import { CommentBodySchema, ImageSchema, MongoIdSchema } from "./utils";

export const createCommentSchema = z.object({
  params: z.object({
    postId: MongoIdSchema,
  }),
  body: z.object({
    parentCommentId: MongoIdSchema.optional(),
    ...CommentBodySchema.shape,
  }),
});

export const editCommentSchema = z.object({
  params: z.object({
    commentId: MongoIdSchema,
  }),
  body: CommentBodySchema,
});

export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: MongoIdSchema,
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    postId: MongoIdSchema,
  }),
  query: z.object({
    parentCommentId: MongoIdSchema.optional(),
    continueAfterId: MongoIdSchema.optional(),
    limit: z.string().optional(),
  }),
});

export const InCommentImageSchema = z.object({
  file: ImageSchema,
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>["body"];
export type CreateCommentParams = z.infer<typeof createCommentSchema>["params"];
export type EditCommentParams = z.infer<typeof editCommentSchema>["params"];
export type EditCommentBody = z.infer<typeof editCommentSchema>["body"];
export type DeleteCommentParams = z.infer<typeof deleteCommentSchema>["params"];
export type GetCommentsParams = z.infer<typeof getCommentsSchema>["params"];
export type GetCommentsQuery = z.infer<typeof getCommentsSchema>["query"];
