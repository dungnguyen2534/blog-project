import express from "express";
import * as UserController from "../controllers/users";
import passport from "passport";

const router = express.Router();

router.post("/signup", UserController.signup);

router.post("/signin", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});

router.post("/signout", UserController.signout);

router.get("/me", UserController.getAuthenticUser);

export default router;
