import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  about: z.string(),
  profilePicUrl: z.string().url(),
  googleId: z.string(),
  githubId: z.string(),
});

export const SignUpBody = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().length(6),
});

export const SignInBody = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const ForgotPasswordBody = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6),
  otp: z.string().length(6),
});

export type User = z.infer<typeof userSchema>;
export type SignUpBody = z.infer<typeof SignUpBody>;
export type SignInBody = z.infer<typeof SignInBody>;
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBody>;
