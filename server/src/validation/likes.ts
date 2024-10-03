import { z } from "zod";
import { MongoIdSchema } from "./utils";

export const LikeSchema = z.object({
  params: z.object({
    targetId: MongoIdSchema,
    targetType: z.string(),
  }),
});

export type LikeParams = z.infer<typeof LikeSchema>["params"];
