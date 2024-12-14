import express from "express";
import * as UsersController from "../controllers/user.controller";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUploadFilter";
import followsRouter from "./follow.route";

// prefix: /users
const router = express.Router();

router.patch(
  "/me",
  requireAuth,
  ImageUploadFilter.single("profilePicture"),
  UsersController.editUserProfile
);

router.use("/", followsRouter);

router.get("/:username", UsersController.getUser);

export default router;
