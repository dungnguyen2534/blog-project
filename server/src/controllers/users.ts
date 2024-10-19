import { RequestHandler } from "express";
import UserModel from "../models/user";
import bcrypt from "bcrypt";
import {
  EditProfileBody,
  EmailVerificationBody,
  ResetPasswordBody,
  SignupBody,
} from "../validation/users";
import createHttpError from "http-errors";
import assertIsDefined from "../utils/assertIsDefined";
import sharp from "sharp";
import env from "../env";
import EmailVerificationToken from "../models/emailVerificationToken";
import crypto from "crypto";
import sendVerificationCode from "../utils/nodeMailer";
import passwordResetToken from "../models/passwordResetToken";
import { invalidateSessions } from "../utils/invalidateSessions";
import FollowerModel from "../models/follower";
import userTagsModel from "../models/userTags";

export const getOTP: RequestHandler<
  unknown,
  unknown,
  EmailVerificationBody,
  unknown
> = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existedEmail = await UserModel.exists({ email })
      .collation({
        locale: "en",
        strength: 2,
      })
      .exec();

    if (existedEmail) {
      throw createHttpError(409, "Email already taken");
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // random 6 digits

    await EmailVerificationToken.create({
      email,
      otp,
    });

    await sendVerificationCode(email, otp);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler<
  unknown,
  unknown,
  SignupBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, email, password: rawPassword, otp } = req.body;

    const existedUsername = await UserModel.exists({ username });
    if (existedUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const OTPCode = await EmailVerificationToken.findOne({
      email,
      otp,
    }).exec();

    if (!OTPCode) {
      throw createHttpError(404, "Invalid or expired verification code");
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

    // req.login provided by passport, login after signup
    req.login(newUser, (err) => {
      if (err) throw err;
      res.status(201).json(newUser);
    });
  } catch (error) {
    next(error);
  }
};

export const getResetPasswordOTP: RequestHandler<
  unknown,
  unknown,
  EmailVerificationBody,
  unknown
> = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existedEmail = await UserModel.exists({ email })
      .collation({
        locale: "en",
        strength: 2,
      })
      .exec();

    if (!existedEmail) {
      throw createHttpError(404, "No user found with this email");
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // random 6 digits
    await passwordResetToken.create({
      email,
      otp,
    });

    await sendVerificationCode(email, otp);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const resetPassword: RequestHandler<
  unknown,
  unknown,
  ResetPasswordBody,
  unknown
> = async (req, res, next) => {
  try {
    const { email, password: rawPassword, otp } = req.body;

    const user = await UserModel.findOne({ email }).select("+password").exec();
    if (!user) {
      throw createHttpError(404, "No user found with this email");
    }

    const matchedOldPassword = user.password
      ? await bcrypt.compare(rawPassword, user.password)
      : false;
    if (matchedOldPassword) {
      throw createHttpError(
        409,
        "New password must be different from the old one"
      );
    }

    const OTPCode = await passwordResetToken
      .findOne({
        email,
        otp,
      })
      .exec();

    if (!OTPCode) {
      throw createHttpError(404, "Invalid or expired verification code");
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

    req.login(user, (err) => {
      if (err) throw err;
      res.status(200).json(user);
    });
  } catch (error) {
    next(error);
  }
};

export const signout: RequestHandler = (req, res) => {
  req.logout((err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
};

export const getUser: RequestHandler = async (req, res, next) => {
  const { username } = req.params;
  const authenticatedUser = req.user;

  try {
    const user = await UserModel.findOne({ username })
      .select("+email")
      .lean()
      .exec();
    if (!user) throw createHttpError(404, "User not found");

    let isLoggedInUserFollowing;
    const condition =
      authenticatedUser &&
      authenticatedUser._id.toString() !== user._id.toString();

    if (condition) {
      isLoggedInUserFollowing = await FollowerModel.exists({
        user: user._id,
        follower: authenticatedUser._id,
      });
    }

    const response = {
      ...user,
      ...(condition && {
        isLoggedInUserFollowing: !!isLoggedInUserFollowing,
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    if (!authenticatedUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    res.status(200).json({ ...user, totalTagsFollowed });
  } catch (error) {
    next(error);
  }
};

export const editUserProfile: RequestHandler<
  unknown,
  unknown,
  EditProfileBody,
  unknown
> = async (req, res, next) => {
  const authenticatedUser = req.user;
  const { username, about } = req.body;
  const profilePicture = req.file;

  try {
    assertIsDefined(authenticatedUser);
    const user = await UserModel.findById(authenticatedUser._id).exec();

    if (user?.username !== username) {
      const usernameExisted = await UserModel.exists({ username }).exec();
      if (usernameExisted) {
        throw createHttpError(409, "Username already taken");
      }
    }

    let profilePicturePath: string | undefined = undefined;
    if (profilePicture) {
      profilePicturePath =
        "/uploads/profile-pictures/" + authenticatedUser._id + ".png";

      await sharp(profilePicture.buffer)
        .resize(500, 500, { withoutEnlargement: true })
        .toFile("./" + profilePicturePath);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      authenticatedUser._id,
      {
        ...(username && { username }),
        ...(!about ? { $unset: { about } } : { about }),
        ...(profilePicturePath && {
          profilePicPath:
            env.SERVER_URL + profilePicturePath + "?lastupdated=" + Date.now(),
        }),
      },
      { new: true } // return updated document
    ).exec();

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
