import { NextFunction, Request, Response } from "express";

/* eslint-disable  @typescript-eslint/no-explicit-any */
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchErrors = (controller: AsyncController): AsyncController => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchErrors;
