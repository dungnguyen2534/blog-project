import UserModel from "../models/user.model";
import {
  EditProfileBody,
  GetUserParams,
} from "../validation/request/user.request";
import createHttpError from "http-errors";
import sharp from "sharp";
import env from "../constant/env";
import FollowerModel from "../models/follower.model";
import { CustomImageType } from "../validation/utils";
import { CONFLICT, NOT_FOUND } from "../constant/httpCode";

export const getUserHandler = async (
  authenticatedUser: Express.User | undefined,
  params: GetUserParams
) => {
  const { username } = params;

  const user = await UserModel.findOne({ username })
    .select("+email")
    .lean()
    .exec();
  if (!user) throw createHttpError(NOT_FOUND, "User not found");

  let isLoggedInUserFollowing;
  const isAuthenticatedRequest =
    authenticatedUser &&
    authenticatedUser._id.toString() !== user._id.toString();

  if (isAuthenticatedRequest) {
    isLoggedInUserFollowing = await FollowerModel.exists({
      user: user._id,
      follower: authenticatedUser._id,
    });
  }

  const userData = {
    ...user,
    ...(isAuthenticatedRequest && {
      isLoggedInUserFollowing: !!isLoggedInUserFollowing,
    }),
  };

  return { userData };
};

export const editUserProfileHandler = async (
  authenticatedUser: Express.User,
  requestData: EditProfileBody,
  profilePicture: CustomImageType | undefined
) => {
  const { about, username } = requestData;
  const user = await UserModel.findById(authenticatedUser._id).exec();

  if (user?.username !== username) {
    const usernameExisted = await UserModel.exists({ username }).exec();
    if (usernameExisted) {
      throw createHttpError(CONFLICT, "Username already taken");
    }
  }

  let profilePicturePath: string | undefined = undefined;
  if (profilePicture) {
    profilePicturePath = `/uploads/profile-pictures/${authenticatedUser._id}.webp`;
    await sharp(profilePicture.buffer)
      .resize(500, 500, { withoutEnlargement: true })
      .webp({ quality: 75 })
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

  return { updatedUser };
};
