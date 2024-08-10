import { z } from "zod";

export const PostSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    body: z.string().min(1, "Body is required"),
  }),
});

export type PostBody = z.infer<typeof PostSchema>["body"];
