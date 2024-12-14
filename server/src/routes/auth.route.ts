import express from "express";
import * as AuthController from "../controllers/auth.controller";
import passport from "passport";
import requireAuth from "../middlewares/requireAuth";
import env from "../constant/env";
import setSessionReturnTo from "../middlewares/setSessionReturnTo";
import {
  OTPRateLimiter,
  // signinLimiter
} from "../middlewares/rateLimiter";

// prefix: /auth
const router = express.Router();

router.post("/get-otp", OTPRateLimiter, AuthController.getOTP);

router.post("/signup", AuthController.signup);

router.post(
  "/signin",
  // signinLimiter,
  passport.authenticate("local"),
  (req, res) => {
    res.status(200).json(req.user);
  }
);

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

// github signin
router.get(
  "/signin/github",
  setSessionReturnTo,
  passport.authenticate("github")
);

router.get(
  "/oauth2/redirect/github",
  passport.authenticate("github", {
    successReturnToOrRedirect: env.CLIENT_URL,
    keepSessionInfo: true,
  })
);

router.post(
  "/get-reset-password-otp",
  OTPRateLimiter,
  AuthController.getResetPasswordOTP
);

router.post("/reset-password", AuthController.resetPassword);

router.post("/signout", AuthController.signout);

router.get("/me", requireAuth, AuthController.getAuthenticatedUser);

export default router;
