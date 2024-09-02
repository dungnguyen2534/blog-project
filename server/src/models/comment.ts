import { InferSchemaType, model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    parentCommentId: { type: Schema.Types.ObjectId },
    body: { type: String, required: true },
    images: {
      type: [String],
    },
  },
  { timestamps: true }
);

export type Comment = InferSchemaType<typeof commentSchema>;
export default model<Comment>("Comment", commentSchema);
