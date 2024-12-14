import {
  tagParamsSchema,
  tagQuerySchema,
} from "../validation/request/tag.request";
import assertIsDefined from "../utils/assertIsDefined";
import catchErrors from "../utils/catchErrors";
import {
  followTagHandler,
  getTagInfoHandler,
  getTagListHandler,
  unFollowTagHandler,
} from "../services/tag.service";
import { OK } from "../constant/httpCode";

export const followTag = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = tagParamsSchema.parse(req.params);

  const { statusCode, followerCount } = await followTagHandler(
    authenticatedUser,
    params
  );
  res.status(statusCode).json({ followerCount });
});

export const unFollowTag = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = tagParamsSchema.parse(req.params);

  const { statusCode, followerCount } = await unFollowTagHandler(
    authenticatedUser,
    params
  );
  res.status(statusCode).json({ followerCount });
});

export const getTagInfo = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;

  const params = tagParamsSchema.parse(req.params);

  const { statusCode, tag } = await getTagInfoHandler(
    authenticatedUser,
    params
  );
  res.status(statusCode).json(tag);
});

export const getTagList = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;

  const requestQuery = tagQuerySchema.parse(req.query);

  const { tagList } = await getTagListHandler(authenticatedUser, requestQuery);
  res.status(OK).json(tagList);
});
