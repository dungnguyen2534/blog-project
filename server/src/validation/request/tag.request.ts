import { z } from "zod";
import { MongoIdSchema } from "../utils";

export const tagParamsSchema = z.object({
  tagName: z.string().optional(),
});

export const tagQuerySchema = z.object({
  continueAfterId: MongoIdSchema.optional(),
  limit: z.string().optional(),
});

export type TagParams = z.infer<typeof tagParamsSchema>;
export type TagQuery = z.infer<typeof tagQuerySchema>;
