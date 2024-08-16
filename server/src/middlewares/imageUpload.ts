import multer from "multer";

export const PostImages = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, done) {
    // check if the file is an image
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      done(null, true);
    } else {
      done(new Error("Please upload an image"));
    }
  },
});
