import mongoose from "mongoose";
import { validateBufferMIMEType } from "validate-image-type";
import { z } from "zod";
import { Readable } from "stream";

export const articleBodySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title should be less than 150 characters"),
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

export const commentBodySchema = z.object({
  parentCommentId: MongoIdSchema.optional(),
  body: z.string().min(1, "Comment body is required"),
  images: z.array(z.string()).optional(),
});

/**
 * Second layer image validation after multer, check if a file is actually an image. This schema needs parseAsync to validate instead of just parse
 */
export const imageSchema = z
  .object({
    fieldname: z.string().optional(),
    originalname: z.string().optional(),
    encoding: z.string().optional(),
    mimetype: z.string(),
    size: z.number().optional(),
    stream: z.instanceof(Readable).optional(),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),
    buffer: z.instanceof(Buffer),
  })
  .superRefine(async (file, ctx) => {
    const result = await validateBufferMIMEType(file.buffer, {
      allowMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (!result.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buffer"],
        message: "Invalid image data",
      });
    }
  });

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

export type ArticleBody = z.infer<typeof articleBodySchema>;
export type CustomImageType = z.infer<typeof imageSchema>;
export type MongoId = z.infer<typeof MongoIdSchema>;
export type CommentBody = z.infer<typeof commentBodySchema>;
