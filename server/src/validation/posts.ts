import { z } from "zod";
import { ImageSchema, MongoIdSchema, PostBodySchema } from "./utils";

export const createPostSchema = z.object({
  body: PostBodySchema,
});

export const updatePostSchema = z.object({
  params: z.object({
    postId: MongoIdSchema,
  }),
  body: PostBodySchema,
});

export const deletePostSchema = z.object({
  params: z.object({
    postId: MongoIdSchema,
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    authorId: MongoIdSchema.optional(),
    continueAfterId: MongoIdSchema.optional(),
    tag: z.string().optional(),
    limit: z.string().optional(),
    saved: z.boolean().optional(),
    top: z.boolean().optional(),
    followed: z.boolean().optional(),
  }),
});

export const getTopPostsSchema = z.object({
  params: z.object({
    timeSpan: z.string(),
  }),
  query: z.object({
    limit: z.string().optional(),
    continueAfterLikeCount: z.string().optional(),
    continueAfterId: MongoIdSchema.optional(),
  }),
});

export const savePostsSchema = z.object({
  params: z.object({
    postId: MongoIdSchema,
  }),
});

export const InPostImageSchema = z.object({
  file: ImageSchema,
});

export type updatePostParams = z.infer<typeof updatePostSchema>["params"];
export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];
export type createPostBody = z.infer<typeof PostBodySchema>;
export type deletePostParams = z.infer<typeof deletePostSchema>["params"];
export type getPostsQuery = z.infer<typeof getPostsSchema>["query"];
export type savePostsParams = z.infer<typeof savePostsSchema>["params"];
export type getTopPostsParams = z.infer<typeof getTopPostsSchema>["params"];
export type getTopPostsQuery = z.infer<typeof getTopPostsSchema>["query"];
