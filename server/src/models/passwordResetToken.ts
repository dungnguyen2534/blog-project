import { InferSchemaType, model, Schema } from "mongoose";

const passwordResetTokenSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: "1h" },
});

export type PasswordResetToken = InferSchemaType<
  typeof passwordResetTokenSchema
>;

export default model<PasswordResetToken>(
  "PasswordResetToken",
  passwordResetTokenSchema
);
