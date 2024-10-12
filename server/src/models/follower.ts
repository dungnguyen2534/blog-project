import { model, Schema } from "mongoose";

const followerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  follower: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, required: true, default: Date.now },
});

followerSchema.index({ userId: 1 });
followerSchema.index({ followerId: 1 });

export default model("Follower", followerSchema);
