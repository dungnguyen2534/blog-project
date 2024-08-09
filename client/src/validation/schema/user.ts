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

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "Username must only contain letters, numbers, and underscores"
  );

const emailSchema = z.string().email();

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/^(?!.* )/, "Password must not contain spaces");

const otpSchema = z.string().refine(
  (val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 100000 && num <= 999999;
  },
  {
    message: "OTP must be a 6-digit number",
  }
);

export const SignUpBody = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const SignInBody = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const ForgotPasswordBody = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
  otp: otpSchema,
});

export type User = z.infer<typeof userSchema>;
export type SignUpBody = z.infer<typeof SignUpBody>;
export type SignInBody = z.infer<typeof SignInBody>;
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBody>;
