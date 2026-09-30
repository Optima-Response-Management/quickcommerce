import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return next(new ApiError(400, "Validation failed", errors));
  }
  req.body = result.data; // cleaned values (trimmed, lowercased email)
  next();
};
export const validateQuery = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(new ApiError(400, "Validation failed", toErrors(result.error.issues)));
  }
  res.locals.query = result.data;
  next();
};