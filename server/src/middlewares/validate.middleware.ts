import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

const toErrors = (issues: { path: PropertyKey[]; message: string }[]) =>
  issues.map((i) => ({ field: i.path.join("."), message: i.message }));

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new ApiError(400, "Validation failed", toErrors(result.error.issues)));
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

export const validateParams = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return next(new ApiError(400, "Validation failed", toErrors(result.error.issues)));
  }
  req.params = result.data as typeof req.params;
  next();
};