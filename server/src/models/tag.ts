import { InferSchemaType, model, Schema } from "mongoose";

const tagSchema = new Schema({
  tagName: { type: String, unique: true, required: true },
  followerCount: { type: Number, default: 0 },
  articleCount: { type: Number, default: 0 },
});

tagSchema.index({ tagName: 1 });

tagSchema.pre("save", function (next) {
  if (this.isModified("tagName")) {
    this.tagName = this.tagName.toLowerCase();
  }
  next();
});

type Tag = InferSchemaType<typeof tagSchema>;
export default model<Tag>("Tag", tagSchema);
