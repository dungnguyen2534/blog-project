import { z } from "zod";
import { userSchema } from "./user";

export const postSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  summary: z.string(),
  author: userSchema,
  images: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PostBodySchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().max(300).optional(),
  body: z.string().min(1),
  images: z.array(z.string()),
});

export const PostPageSchema = z.object({
  posts: z.array(postSchema),
  currentPage: z.number(),
  totalPages: z.number(),
});

export type Post = z.infer<typeof postSchema>;
export type createPostBody = z.infer<typeof PostBodySchema>;
export type updatePostBody = z.infer<typeof PostBodySchema>;
export type PostPage = z.infer<typeof PostPageSchema>;
