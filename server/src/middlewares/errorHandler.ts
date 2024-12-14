import { ErrorRequestHandler, Response } from "express";
import { isHttpError } from "http-errors";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constant/httpCode";

const zodError = (res: Response, error: ZodError) => {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  res.status(BAD_REQUEST).json({
    errors,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: "${req.path}",`, error);

  let statusCode = INTERNAL_SERVER_ERROR;
  let errorMessage = "Internal Server Error";

  if (error instanceof ZodError) {
    return zodError(res, error);
  }

  if (error instanceof MulterError) {
    return res.status(BAD_REQUEST).json({ message: "Invalid image type" });
  }

  if (isHttpError(error)) {
    statusCode = error.statusCode;
    errorMessage = error.message;
  }

  res.status(statusCode).json({ message: errorMessage });
};

export default errorHandler;
