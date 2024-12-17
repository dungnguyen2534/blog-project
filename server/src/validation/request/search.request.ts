import { z } from "zod";

export const searchQuerySchema = z.object({
  searchQuery: z.string(),
});

export type searchQuery = z.infer<typeof searchQuerySchema>;
