import { z } from "zod";

export const tagSchema = z.object({
  _id: z.string(),
  tagName: z.string(),
  postCount: z.number(),
  followerCount: z.number(),
  isLoggedInUserFollowing: z.boolean().optional(),
});

export type Tag = z.infer<typeof tagSchema>;
