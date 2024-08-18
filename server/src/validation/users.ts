import { z } from "zod";
import {
  usernameSchema,
  emailSchema,
  passwordSchema,
  otpSchema,
} from "./utils";

export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    otp: otpSchema,
  }),
});

export type SignupBody = z.infer<typeof signupSchema>["body"];
