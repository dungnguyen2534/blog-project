import { z } from "zod";

export const quickSearchQuerySchema = z.object({
  searchQuery: z.string(),
});

export type QuickSearchQuery = z.infer<typeof quickSearchQuerySchema>;
