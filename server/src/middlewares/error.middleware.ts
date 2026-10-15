import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export const notFound: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError
    ? err.statusCode
    : 500;

  const message = isApiError
    ? err.message
    : "Internal server error";

  if (statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.errors
      ? { errors: err.errors }
      : {}),
  });
};