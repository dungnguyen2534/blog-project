import { z } from "zod";
import { MongoIdSchema } from "../utils";

export const followUserParamsSchema = z.object({
  userId: MongoIdSchema,
});

export const getFollowersQuerySchema = z.object({
  continueAfterId: MongoIdSchema.optional(),
  limit: z.string().optional(),
});

export const getFollowingsQuerySchema = z.object({
  continueAfterId: MongoIdSchema.optional(),
  limit: z.string().optional(),
});

export type FollowUserParams = z.infer<typeof followUserParamsSchema>;
export type GetFollowersQuery = z.infer<typeof getFollowersQuerySchema>;
export type GetFollowingsQuery = z.infer<typeof getFollowingsQuerySchema>;
