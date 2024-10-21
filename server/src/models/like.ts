import { model, Schema } from "mongoose";

const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    targetType: { type: String, required: true, enum: ["article", "comment"] },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1 });
likeSchema.index({ targetId: 1, targetType: 1 });

export default model("Like", likeSchema);
