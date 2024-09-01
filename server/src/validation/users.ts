import { z } from "zod";
import {
  usernameSchema,
  emailSchema,
  passwordSchema,
  otpSchema,
  ImageSchema,
} from "./utils";

export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    otp: otpSchema,
  }),
});

export const emailVerificationBodySchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const editProfileSchema = z.object({
  body: z.object({
    username: usernameSchema.optional(),
    about: z.string().optional(),
  }),
});

export const profilePictureSchema = z.object({
  file: ImageSchema,
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    otp: otpSchema,
  }),
});

export type SignupBody = z.infer<typeof signupSchema>["body"];
export type EmailVerificationBody = z.infer<
  typeof emailVerificationBodySchema
>["body"];
export type EditProfileBody = z.infer<typeof editProfileSchema>["body"];
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>["body"];
