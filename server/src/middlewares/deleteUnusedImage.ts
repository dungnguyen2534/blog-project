import { RequestHandler } from "express";
import TempImageModel from "../models/tempImage.model";
import path from "path";
import fs from "fs";
import { NO_CONTENT, OK } from "../constant/httpCode";

const deleteUnusedImage: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    if (!authenticatedUser) return res.sendStatus(NO_CONTENT);

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
      res.sendStatus(OK);
    } else {
      res.sendStatus(NO_CONTENT);
    }
  } catch (error) {
    next(error);
  }
};

export default deleteUnusedImage;
