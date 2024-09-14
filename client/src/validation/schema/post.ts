import { z } from "zod";
import { userSchema } from "./user";

export const postSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  summary: z.string(),
  author: userSchema,
  tags: z.array(z.string()),
  images: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PostBodySchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().max(180).optional(),
  body: z.string().min(1),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()),
});

export const PostPageSchema = z.object({
  posts: z.array(postSchema),
  currentPage: z.number(),
  totalPages: z.number(),
});

export const CommentBodySchema = z.object({
  body: z.string().min(1),
  images: z.array(z.string()),
});

export const CommentSchema = z.object({
  parentCommentId: z.string().optional(),
  body: z.string().min(1),
  images: z.array(z.string()),
});

export type Post = z.infer<typeof postSchema>;
export type createPostBody = z.infer<typeof PostBodySchema>;
export type updatePostBody = z.infer<typeof PostBodySchema>;
export type PostPage = z.infer<typeof PostPageSchema>;
export type Comment = z.infer<typeof CommentBodySchema>;
export type CreateCommentBody = z.infer<typeof CommentSchema>;
