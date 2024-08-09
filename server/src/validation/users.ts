import { z } from "zod";

const emailSchema = z.string().email();

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "Username must only contain letters, numbers, and underscores"
  );

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

export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    otp: otpSchema,
  }),
});

export type SignupBody = z.infer<typeof signupSchema>["body"];
