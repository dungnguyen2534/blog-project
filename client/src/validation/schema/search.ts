import { z } from "zod";
import { ArticleSchema } from "./article";
import { userSchema } from "./user";
import { tagSchema } from "./tag";

export const quickSearchDataSchema = z.object({
  articles: z.array(ArticleSchema.omit({ body: true, images: true })),
  users: z.array(userSchema.omit({ password: true, email: true })),
  tags: z.array(tagSchema),
});

export type QuickSearchData = z.infer<typeof quickSearchDataSchema>;
