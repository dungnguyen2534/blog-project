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