import { RequestHandler } from "express";
import TempImageModel from "../models/tempImage";
import path from "path";
import fs from "fs";

const deleteUnusedImage: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    if (!authenticatedUser) return res.sendStatus(204);

    const unusedImages = await TempImageModel.find({
      userId: authenticatedUser._id,
      temporary: true,
    });

    if (unusedImages.length > 0) {
      const unusedImagesPath = unusedImages.map((image) => image.imagePath);

      for (const imagePath of unusedImagesPath) {
        const imagesPathToDelete = path.join(__dirname, "../..", imagePath);
        await fs.promises.unlink(imagesPathToDelete);
      }

      await TempImageModel.deleteMany({ imagePath: { $in: unusedImagesPath } });
      res.sendStatus(200);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
};

export default deleteUnusedImage;
