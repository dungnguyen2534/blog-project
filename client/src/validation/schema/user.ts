import { z } from "zod";

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

const otpSchema = z
  .string()
  .optional() // this here not make the field optional, add this to make the message of the refine show up instead of "required"
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 100000 && num <= 999999;
    },
    {
      message: "OTP must be a 6-digit number",
    }
  );

export const userSchema = z.object({
  _id: z.string(),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  about: z.string(),
  totalFollowers: z.number(),
  totalFollowing: z.number(),
  totalArticles: z.number(),
  totalTagsFollowed: z.number(),
  profilePicPath: z.string().url(),
  createdAt: z.string(),
  isLoggedInUserFollowing: z.boolean().optional(),
});

export const SignUpBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const SignInBodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const EditProfileBodySchema = z.object({
  username: usernameSchema.optional(),
  about: z.string().optional(),
  profilePicture: z
    .instanceof(File)
    .refine((file) => file.size < 5000000, {
      message: "Your profile image must be less than 5MB.",
    })
    .optional(),
});

export const ForgotPasswordBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const OnboardingBodySchema = z.object({
  username: usernameSchema,
});

export type User = z.infer<typeof userSchema>;
export type SignUpBody = z.infer<typeof SignUpBodySchema>;
export type SignInBody = z.infer<typeof SignInBodySchema>;
export type EditProfileBody = z.infer<typeof EditProfileBodySchema>;
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>;
export type OnboardingBody = z.infer<typeof OnboardingBodySchema>;
