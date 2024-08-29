import express from "express";
import * as UserController from "../controllers/users";
import passport from "passport";
import validateRequest from "../middlewares/validateRequest";
import { editProfileSchema, signupSchema } from "../validation/users";
import requireAuth from "../middlewares/requireAuth";
import { ImageUploadFilter } from "../middlewares/imageUpload";
import env from "../env";
import setSessionReturnTo from "../middlewares/setSessionReturnTo";

const router = express.Router();

router.post("/signup", validateRequest(signupSchema), UserController.signup);

router.post("/signin", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});

// google signin
router.get(
  "/signin/google",
  setSessionReturnTo,
  passport.authenticate("google")
);

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successReturnToOrRedirect: env.CLIENT_URL,
    keepSessionInfo: true, // https://github.com/jaredhanson/passport/issues/919
  })
);

router.post("/signout", UserController.signout);

router.get("/me", requireAuth, UserController.getAuthenticatedUser);

router.patch(
  "/me",
  requireAuth,
  ImageUploadFilter.single("profilePicture"),
  validateRequest(editProfileSchema),
  UserController.editUserProfile
);

router.get("/users/:username", UserController.getUser);

export default router;
