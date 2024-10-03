import { model, Schema } from "mongoose";

const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    targetType: { type: String, required: true, enum: ["post", "comment"] },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default model("Like", likeSchema);
