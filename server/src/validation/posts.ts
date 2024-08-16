import { z } from "zod";
import { validateBufferMIMEType } from "validate-image-type";

export const PostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1)
      .max(150, "Title should be less than 150 characters"),
    body: z.string().min(1),
    images: z.array(z.string()).optional(),
    summary: z
      .string()
      .max(300, "Summary should be less than 300 characters")
      .optional(),
  }),
});

export const InPostImageSchema = z.object({
  file: z.custom<Express.Multer.File>(
    async (file) => {
      if (!file) return true; // image is not required

      // if there is an image, validate it
      const result = await validateBufferMIMEType(file.buffer, {
        allowMimeTypes: ["image/jpeg", "image/jpg", "image/png"],
      });
      return result.ok;
    },
    {
      message: "Invalid image",
    }
  ),
});

export type PostBody = z.infer<typeof PostSchema>["body"];
