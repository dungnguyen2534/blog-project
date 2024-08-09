import { RequestHandler } from "express";
import { Schema, ZodError } from "zod";

const validateRequest =
  (schema: Schema): RequestHandler =>
  async (req, res, next) => {
    try {
      await schema.parseAsync(req);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => err.message).join(", ");
        return res.status(400).json({
          message: errorDetails,
        });
      } else {
        next(error);
      }
    }
  };

export default validateRequest;
