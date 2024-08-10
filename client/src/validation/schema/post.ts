import { z } from "zod";
import { userSchema } from "./user";

export const postSchema = z.object({
  _id: z.string(),
  slugId: z.string(),
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  summary: z.string(),
  author: userSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPostBody = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().min(1),
});

export type Post = z.infer<typeof postSchema>;
export type createPostBody = z.infer<typeof createPostBody>;
