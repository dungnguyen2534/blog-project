import { z } from "zod";
import { MongoIdSchema } from "./utils";

export const TagSchema = z.object({
  params: z.object({
    tagName: z.string().optional(),
  }),
  query: z.object({
    continueAfterId: MongoIdSchema.optional(),
    limit: z.string().optional(),
  }),
});

export type TagParams = z.infer<typeof TagSchema>["params"];
export type TagQuery = z.infer<typeof TagSchema>["query"];
