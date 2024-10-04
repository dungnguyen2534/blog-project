import { InferSchemaType, model, Schema } from "mongoose";

// sparse: true - allow null and undefined value for unique fields(for social login/signup)
// select: false, will not return the field in the response by default(sensitive data)

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
    about: {
      type: String,
    },
    totalFollowers: {
      type: Number,
      default: 0,
    },
    totalPosts: {
      type: Number,
      default: 0,
    },
    profilePicPath: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (!this.googleId && !this.githubId && !this.email) {
    return next(new Error("Email or social login is required"));
  }

  next();
});

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema);
