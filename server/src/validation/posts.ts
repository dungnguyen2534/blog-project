import { z } from "zod";

export const PostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1)
      .max(150, "Title should be less than 150 characters"),
    summary: z
      .string()
      .max(300, "Summary should be less than 300 characters")
      .optional(),
    body: z.string().min(1),
  }),
});

export type PostBody = z.infer<typeof PostSchema>["body"];
