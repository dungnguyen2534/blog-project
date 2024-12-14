import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import {
  EmailVerificationBody,
  ResetPasswordBody,
  SignupBody,
} from "../validation/request/user.request";
import createHttpError from "http-errors";
import EmailVerificationToken from "../models/emailVerificationToken.model";
import crypto from "crypto";
import sendVerificationCode from "../utils/nodeMailer";
import passwordResetToken from "../models/passwordResetToken.model";
import { invalidateSessions } from "../utils/invalidateSessions";
import userTagsModel from "../models/userTags.model";
import { BAD_REQUEST, CONFLICT, NOT_FOUND, OK } from "../constant/httpCode";

export const getOTPHandler = async (requestData: EmailVerificationBody) => {
  const { email } = requestData;

  const existedEmail = await UserModel.exists({ email })
    .collation({
      locale: "en",
      strength: 2,
    })
    .exec();

  if (existedEmail) {
    throw createHttpError(CONFLICT, "Email already taken");
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // random 6 digits

  await EmailVerificationToken.create({
    email,
    otp,
  });

  await sendVerificationCode(email, otp);
};

export const signupHandler = async (requestData: SignupBody) => {
  const { username, email, password: rawPassword, otp } = requestData;

  const existedUsername = await UserModel.exists({ username });
  if (existedUsername) {
    throw createHttpError(CONFLICT, "Username already taken");
  }

  const OTPCode = await EmailVerificationToken.findOne({
    email,
    otp,
  }).exec();

  if (!OTPCode) {
    throw createHttpError(BAD_REQUEST, "Invalid or expired verification code");
  } else {
    await EmailVerificationToken.deleteOne();
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const result = await UserModel.create({
    email,
    username,
    password: hashedPassword,
  });

  const newUser = result.toObject();
  delete newUser.password;

  return { newUser };
};

export const getResetPasswordOTPHandler = async (
  requestData: EmailVerificationBody
) => {
  const { email } = requestData;

  const existedEmail = await UserModel.exists({ email })
    .collation({
      locale: "en",
      strength: 2,
    })
    .exec();

  if (!existedEmail) {
    throw createHttpError(NOT_FOUND, "No user found with this email");
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // random 6 digits
  await passwordResetToken.create({
    email,
    otp,
  });

  await sendVerificationCode(email, otp);
};

export const resetPasswordHandler = async (requestData: ResetPasswordBody) => {
  const { email, password: rawPassword, otp } = requestData;

  const user = await UserModel.findOne({ email }).select("+password").exec();
  if (!user) {
    throw createHttpError(NOT_FOUND, "No user found with this email");
  }

  const matchedOldPassword = user.password
    ? await bcrypt.compare(rawPassword, user.password)
    : false;
  if (matchedOldPassword) {
    throw createHttpError(CONFLICT, "New password must be different");
  }

  const OTPCode = await passwordResetToken
    .findOne({
      email,
      otp,
    })
    .exec();

  if (!OTPCode) {
    throw createHttpError(NOT_FOUND, "Invalid or expired verification code");
  } else {
    await OTPCode.deleteOne();
  }

  await invalidateSessions(user._id.toString());

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  user.email = email;
  user.password = hashedPassword;
  await user.save();

  user.toObject();
  delete user.password;

  return { user };
};

export const getAuthenticatedUserHandler = async (
  authenticatedUser: Express.User
) => {
  const user = await UserModel.findById(authenticatedUser._id)
    .select("+email")
    .lean()
    .exec();

  const totalTagsFollowed = (
    await userTagsModel
      .findOne({
        user: authenticatedUser._id,
      })
      .exec()
  )?.followedTags.length;

  return { statusCode: OK, userdata: { ...user, totalTagsFollowed } };
};
