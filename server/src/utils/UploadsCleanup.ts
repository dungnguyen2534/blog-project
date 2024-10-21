import fs from "fs";
import path from "path";
import tempImageModel from "../models/tempImage";

const UPLOADS_FOLDER = path.join(__dirname, "../../uploads/in-article-images");
const FILE_AGE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

export default async function uploadsCleanup() {
  try {
    const unusedImages = await tempImageModel.find({ temporary: true });
    for (const image of unusedImages) {
      const filePath = path.join(
        UPLOADS_FOLDER,
        path.basename(image.imagePath)
      );
      const stats = await fs.promises.stat(filePath);
      const now = Date.now();
      const fileAge = now - stats.mtimeMs;
      if (fileAge > FILE_AGE_THRESHOLD) {
        await tempImageModel.deleteOne({ _id: image._id });
        await fs.promises.unlink(filePath);
      }
    }
  } catch (err) {
    console.log("Error cleaning up uploads:", err);
  }
}
