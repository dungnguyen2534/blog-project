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

export const InPostImageSchema = z.object({
  file: ImageSchema,
});

export type updatePostParams = z.infer<typeof updatePostSchema>["params"];
export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];
export type createPostBody = z.infer<typeof PostBodySchema>;
export type deletePostParams = z.infer<typeof deletePostSchema>["params"];
