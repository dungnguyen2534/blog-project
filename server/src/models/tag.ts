import { model, Schema } from "mongoose";

const tagSchema = new Schema({
  tagName: { type: String, unique: true, required: true },
  followerCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
});

tagSchema.index({ tagName: 1 });

export default model("Tag", tagSchema);
