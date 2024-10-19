import { InferSchemaType, Schema, model } from "mongoose";

const SavedPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  postId: { type: Schema.Types.ObjectId, required: true },
  postTitle: { type: String, required: true },
  tags: { type: [String], default: [] },
});

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

type SavedPost = InferSchemaType<typeof SavedPostSchema>;
export default model<SavedPost>("SavedPost", SavedPostSchema);
