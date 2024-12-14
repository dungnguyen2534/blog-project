import {
  followUserParamsSchema,
  getFollowersQuerySchema,
  getFollowingsQuerySchema,
} from "../validation/request/follow.request";
import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  followUserHandler,
  getFollowersHandler,
  getFollowingsHandler,
  unFollowUserHandler,
} from "../services/follow.service";
import { OK } from "../constant/httpCode";

export const followUser = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = followUserParamsSchema.parse(req.params);

  const { statusCode, totalFollowers } = await followUserHandler(
    authenticatedUser,
    params
  );

  res.status(statusCode).json({ totalFollowers });
});

export const unFollowUser = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = followUserParamsSchema.parse(req.params);

  const { statusCode, totalFollowers } = await unFollowUserHandler(
    authenticatedUser,
    params
  );

  res.status(statusCode).json({ totalFollowers });
});

export const getFollowers = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const requestQuery = getFollowersQuerySchema.parse(req.query);

  const { followers, isLastFollowerReached } = await getFollowersHandler(
    authenticatedUser,
    requestQuery
  );
  res.status(OK).json({ followers, isLastFollowerReached });
});

export const getFollowings = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);
  const requestQuery = getFollowingsQuerySchema.parse(req.query);

  const { following, isLastFollowingReached } = await getFollowingsHandler(
    authenticatedUser,
    requestQuery
  );

  res.status(OK).json({ following, isLastFollowingReached });
});
