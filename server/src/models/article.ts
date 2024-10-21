import { InferSchemaType, model, Schema } from "mongoose";

const articleSchema = new Schema(
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

articleSchema.index({ slug: 1 });
articleSchema.index({ likeCount: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ tags: 1 });

type Article = InferSchemaType<typeof articleSchema>;
export default model<Article>("Article", articleSchema);
