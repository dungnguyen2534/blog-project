import { InferSchemaType, model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    tags: {
      type: [String],
    },
    images: {
      type: [String],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ slug: 1 });
postSchema.index({ likeCount: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

type Post = InferSchemaType<typeof postSchema>;
export default model<Post>("Post", postSchema);
