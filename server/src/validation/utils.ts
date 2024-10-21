import mongoose from "mongoose";
import { validateBufferMIMEType } from "validate-image-type";
import { z } from "zod";

export const ArticleBodySchema = z.object({
  title: z.string().min(1).max(150, "Title should be less than 150 characters"),
  body: z.string().min(1, "Body is required"),
  tags: z
    .array(z.string())
    .refine((tags) => tags.every((tag) => tag.startsWith("#")), {
      message: "Each tag must start with a '#' symbol.",
    })
    .optional(),
  images: z.array(z.string()).optional(),
  summary: z
    .string()
    .max(180, "Summary should be less than 180 characters")
    .optional(),
});

export const MongoIdSchema = z.string().refine((id) => {
  return mongoose.Types.ObjectId.isValid(id);
}, "Invalid ID");

export const CommentBodySchema = z.object({
  body: z.string().min(1, "Comment body is required"),
  images: z.array(z.string()).optional(),
});

export const ImageSchema = z.custom<Express.Multer.File>(
  async (file) => {
    if (!file) return true; // image is not required

    // if there is an image, validate it
    const result = await validateBufferMIMEType(file.buffer, {
      allowMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });
    return result.ok;
  },
  {
    message: "Invalid image type",
  }
);

export const emailSchema = z.string().email();

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "Username must only contain letters, numbers, and underscores"
  );

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/^(?!.* )/, "Password must not contain spaces");

export const otpSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 100000 && num <= 999999;
    },
    {
      message: "OTP must be a 6-digit number",
    }
  );
