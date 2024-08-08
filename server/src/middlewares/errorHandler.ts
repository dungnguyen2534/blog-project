import { ErrorRequestHandler } from "express";
import { isHttpError } from "http-errors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  if (isHttpError(err)) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  }

  res.status(statusCode).json({ message: errorMessage });
};

export default errorHandler;
