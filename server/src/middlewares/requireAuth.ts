import { RequestHandler } from "express";
import createHttpError from "http-errors";

const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return next(createHttpError(401, "You are not authorized for this action"));
  }

  next();
};

export default requireAuth;
