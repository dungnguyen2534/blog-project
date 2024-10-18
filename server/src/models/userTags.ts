import { InferSchemaType, model, Schema } from "mongoose";

const arrayUnique = (value: string[]) =>
  Array.isArray(value) && new Set(value).size === value.length;

const userTagsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  followedTags: [
    {
      type: String,
      required: true,
      validate: [arrayUnique, "Each saved tag must be unique"],
    },
  ],
  savedTags: [
    {
      type: String,
      required: true,
      validate: [arrayUnique, "Each saved tag must be unique"],
    },
  ],
});

type UserTags = InferSchemaType<typeof userTagsSchema>;
export default model<UserTags>("UserTags", userTagsSchema);
