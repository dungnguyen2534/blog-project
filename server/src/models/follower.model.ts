import { model, Schema } from "mongoose";

const followerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  follower: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, required: true, default: Date.now },
});

export default model("Follower", followerSchema);
