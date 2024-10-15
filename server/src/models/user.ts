import { InferSchemaType, model, Schema } from "mongoose";

// sparse: true - allow null and undefined value for unique fields(for social login/signup)

const userSchema = new Schema({
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
  totalFollowing: {
    type: Number,
    default: 0,
  },
  totalPosts: {
    type: Number,
    default: 0,
  },
  savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post", select: false }],
  followedTags: [{ type: String, select: false }],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("validate", function (next) {
  if (!this.googleId && !this.githubId && !this.email) {
    return next(new Error("Email or social login is required"));
  }

  next();
});

userSchema.index({ totalFollowers: 1 });
userSchema.index({ totalFollowing: 1 });

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema);
