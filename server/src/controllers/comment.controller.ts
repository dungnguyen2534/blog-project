import assertIsDefined from "../utils/assertIsDefined";
import {
  createCommentParamsSchema,
  deleteCommentParamsSchema,
  editCommentParamsSchema,
  getCommentListParamsSchema,
  getCommentListQuerySchema,
} from "../validation/request/comment.request";
import catchErrors from "../utils/catchErrors";
import {
  createCommentHandler,
  deleteCommentHandler,
  editCommentHandler,
  getCommentListHandler,
  uploadInCommentImageHandler,
} from "../services/comment.service";
import { commentBodySchema, imageSchema } from "../validation/utils";
import { CREATED, OK } from "../constant/httpCode";

export const createComment = catchErrors(async (req, res) => {
  const params = createCommentParamsSchema.parse(req.params);
  const requestBody = commentBodySchema.parse(req.body);

  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const { newComment } = await createCommentHandler(
    authenticatedUser,
    params,
    requestBody
  );

  res.status(CREATED).json(newComment);
});

export const editComment = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = editCommentParamsSchema.parse(req.params);
  const requestBody = commentBodySchema.parse(req.body);

  const { updatedComment } = await editCommentHandler(
    authenticatedUser,
    params,
    requestBody
  );

  res.status(OK).json(updatedComment);
});

export const deleteComment = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const params = deleteCommentParamsSchema.parse(req.params);

  const { totalComments } = await deleteCommentHandler(
    authenticatedUser,
    params
  );

  res.status(OK).json({ totalComments });
});

export const getCommentList = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  const params = getCommentListParamsSchema.parse(req.params);
  const requestQuery = getCommentListQuerySchema.parse(req.query);

  const commentList = await getCommentListHandler(
    authenticatedUser,
    params,
    requestQuery
  );

  res.status(OK).json(commentList);
});

export const uploadInCommentImage = catchErrors(async (req, res) => {
  const authenticatedUser = req.user;
  assertIsDefined(authenticatedUser);

  const image = await imageSchema.parseAsync(req.file);
  const { imageUrl } = await uploadInCommentImageHandler(
    authenticatedUser,
    image
  );
  res.status(CREATED).json({ imageUrl });
});
