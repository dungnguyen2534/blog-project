import { InferSchemaType, model, Schema } from "mongoose";

const arrayUnique = (value: string[]) =>
  Array.isArray(value) && new Set(value).size === value.length;

const userFollowedTagSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  followedTags: [
    {
      type: String,
      required: true,
      validate: [arrayUnique, "Each saved tag must be unique"],
    },
  ],
});

type UserFollowedTag = InferSchemaType<typeof userFollowedTagSchema>;
export default model<UserFollowedTag>("UserFollowedTag", userFollowedTagSchema);
