import { InferSchemaType, model, Schema } from "mongoose";

const emailVerificationTokenSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: "10m" },
});

export type EmailVerificationToken = InferSchemaType<
  typeof emailVerificationTokenSchema
>;

export default model<EmailVerificationToken>(
  "EmailVerificationToken",
  emailVerificationTokenSchema
);
