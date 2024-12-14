import { InferSchemaType, model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    articleId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    parentCommentId: { type: Schema.Types.ObjectId },
    body: { type: String, required: true },
    likeCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
    },
  },
  { timestamps: true }
);

commentSchema.index({ articleId: 1 });
commentSchema.index({ parentCommentId: 1 });

export type Comment = InferSchemaType<typeof commentSchema>;
export default model<Comment>("Comment", commentSchema);
