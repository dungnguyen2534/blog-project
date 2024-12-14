import { RequestHandler } from "express";
import {
  emailVerificationBodySchema,
  resetPasswordBodySchema,
  signUpBodySchema,
} from "../validation/request/user.request";
import createHttpError from "http-errors";
import catchErrors from "../utils/catchErrors";
import {
  getAuthenticatedUserHandler,
  getOTPHandler,
  getResetPasswordOTPHandler,
  resetPasswordHandler,
  signupHandler,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constant/httpCode";

export const getOTP = catchErrors(async (req, res) => {
  const requestData = emailVerificationBodySchema.parse(req.body);

  await getOTPHandler(requestData);
  res.sendStatus(OK);
});

export const signup = catchErrors(async (req, res) => {
  const requestData = signUpBodySchema.parse(req.body);
  const { newUser } = await signupHandler(requestData);

  // req.login provided by passport, login after signup
  req.login(newUser, (err) => {
    if (err) throw err;
    res.status(CREATED).json(newUser);
  });
});

export const getResetPasswordOTP = catchErrors(async (req, res) => {
  const requestData = emailVerificationBodySchema.parse(req.body);

  await getResetPasswordOTPHandler(requestData);
  res.sendStatus(OK);
});

export const resetPassword = catchErrors(async (req, res) => {
  const requestData = resetPasswordBodySchema.parse(req.body);

  const { user } = await resetPasswordHandler(requestData);

  req.login(user, (err) => {
    if (err) throw err;
    res.status(OK).json(user);
  });
});

export const signout: RequestHandler = (req, res) => {
  req.logout((err) => {
    if (err) throw err;
    res.sendStatus(OK);
  });
};

export const getAuthenticatedUser = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    throw createHttpError(UNAUTHORIZED, "Unauthorized");
  }

  const { statusCode, userdata } = await getAuthenticatedUserHandler(
    authenticatedUser
  );

  res.status(statusCode).json(userdata);
});
