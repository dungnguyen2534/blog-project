import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { UNAUTHORIZED } from "../constant/httpCode";

const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return next(
      createHttpError(UNAUTHORIZED, "You are not authorized for this action")
    );
  }

  next();
};

export default requireAuth;
