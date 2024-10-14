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
  likeCount: z.number(),
  isLoggedInUserLiked: z.boolean().optional(),
  isSavedPost: z.boolean().optional(),
  commentCount: z.number(),
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
  lastPostReached: z.boolean(),
});

export const CommentSchema = z.object({
  postId: z.string(),
  _id: z.string(),
  author: userSchema,
  parentCommentId: z.string().optional(),
  body: z.string().min(1),
  images: z.array(z.string()),
  likeCount: z.number(),
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

export type Post = z.infer<typeof postSchema>;
export type PostBody = z.infer<typeof PostBodySchema>;
export type PostPage = z.infer<typeof PostPageSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CommentBody = z.infer<typeof CommentBodySchema>;
export type CommentPage = z.infer<typeof commentPageSchema>;
