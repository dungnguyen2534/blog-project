import { InferSchemaType, Schema, model } from "mongoose";

const SavedArticleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  articleId: { type: Schema.Types.ObjectId, required: true },
  articleTitle: { type: String, required: true },
  tags: { type: [String], default: [] },
});

SavedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

type SavedArticle = InferSchemaType<typeof SavedArticleSchema>;
export default model<SavedArticle>("savedArticle", SavedArticleSchema);
