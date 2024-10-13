import { InferSchemaType, model, Schema } from "mongoose";

const tempImageSchema = new Schema({
  imagePath: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  temporary: {
    type: Boolean,
    default: true,
  },
});

tempImageSchema.index({ userId: 1 });
tempImageSchema.index({ temporary: 1 });

type Post = InferSchemaType<typeof tempImageSchema>;
export default model<Post>("TempImage", tempImageSchema);
