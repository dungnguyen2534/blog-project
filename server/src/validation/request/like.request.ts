import { z } from "zod";
import { MongoIdSchema } from "../utils";

export const likeSchemaParams = z.object({
  targetId: MongoIdSchema,
  targetType: z.string(),
});

export type LikeParams = z.infer<typeof likeSchemaParams>;
