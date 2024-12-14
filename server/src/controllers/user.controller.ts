import {
  editProfileBodySchema,
  getUserParamsSchema,
} from "../validation/request/user.request";
import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  editUserProfileHandler,
  getUserHandler,
} from "../services/user.service";
import { CustomImageType, imageSchema } from "../validation/utils";
import { OK } from "../constant/httpCode";

export const getUser = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  const params = getUserParamsSchema.parse(req.params);

  const { userData } = await getUserHandler(authenticatedUser, params);
  res.status(OK).json(userData);
});

export const editUserProfile = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const requestData = editProfileBodySchema.parse(req.body);

  let profilePicture: CustomImageType | undefined = undefined;
  if (req.file) {
    profilePicture = await imageSchema.parseAsync(req.file);
  }

  const { updatedUser } = await editUserProfileHandler(
    authenticatedUser,
    requestData,
    profilePicture
  );

  res.status(OK).json(updatedUser);
});
