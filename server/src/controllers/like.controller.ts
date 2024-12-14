import assertIsDefined from "../utils/assertIsDefined";
import { likeSchemaParams } from "../validation/request/like.request";
import catchErrors from "../utils/catchErrors";
import {
  likeTargetHandler,
  unlikeTargetHandler,
} from "../services/like.service";

export const likeTarget = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = likeSchemaParams.parse(req.params);

  const { statusCode, totalLikes } = await likeTargetHandler(
    authenticatedUser,
    params
  );
  res.status(statusCode).json({ totalLikes });
});

export const unlikeTarget = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = likeSchemaParams.parse(req.params);

  const { statusCode, totalLikes } = await unlikeTargetHandler(
    authenticatedUser,
    params
  );
  res.status(statusCode).json({ totalLikes });
});
