import mongoose from "mongoose";
import { validateBufferMIMEType } from "validate-image-type";
import { z } from "zod";

export const PostBodySchema = z.object({
  title: z.string().min(1).max(150, "Title should be less than 150 characters"),
  body: z.string().min(1),
  images: z.array(z.string()),
  summary: z
    .string()
    .max(300, "Summary should be less than 300 characters")
    .optional(),
});

export const MongoIdSchema = z.string().refine((id) => {
  return mongoose.Types.ObjectId.isValid(id);
}, "Invalid ID");

export const ImageSchema = z.custom<Express.Multer.File>(
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
);
