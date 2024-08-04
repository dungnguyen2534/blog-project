import { z } from "zod";

export const postSchema = z.object({
  _id: z.string(),
  title: z.string(),
  body: z.string(),
});

export const createPostBody = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

export type Post = z.infer<typeof postSchema>;
export type createPostBody = z.infer<typeof createPostBody>;
