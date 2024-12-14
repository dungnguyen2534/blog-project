import { z } from "zod";
import {
  usernameSchema,
  emailSchema,
  passwordSchema,
  otpSchema,
} from "../utils";

export const signUpBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const emailVerificationBodySchema = z.object({
  email: emailSchema,
});

export const editProfileBodySchema = z.object({
  username: usernameSchema.optional(),
  about: z.string().optional(),
});

export const resetPasswordBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const getUserParamsSchema = z.object({
  username: usernameSchema,
});

export type SignupBody = z.infer<typeof signUpBodySchema>;
export type EmailVerificationBody = z.infer<typeof emailVerificationBodySchema>;
export type EditProfileBody = z.infer<typeof editProfileBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type GetUserParams = z.infer<typeof getUserParamsSchema>;
