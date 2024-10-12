import { z } from "zod";
import { MongoIdSchema } from "./utils";

export const FollowSchema = z.object({
  params: z.object({
    userId: MongoIdSchema,
  }),
});

export const GetFollowersSchema = z.object({
  query: z.object({
    continueAfterId: MongoIdSchema.optional(),
    limit: z.number().optional(),
  }),
});

export const GetFollowingSchema = z.object({
  query: z.object({
    continueAfterId: MongoIdSchema.optional(),
    limit: z.number().optional(),
  }),
});

export type FollowParams = z.infer<typeof FollowSchema>["params"];
export type GetFollowers = z.infer<typeof GetFollowersSchema>["query"];
export type GetFollowing = z.infer<typeof GetFollowingSchema>["query"];
