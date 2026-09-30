import { NextFunction, Request, Response } from "express";
import { Feature } from "../config/contstants";
import { ApiError } from "../utils/ApiError";

// Use after `authenticate`. Super admins pass every check.
export const requireFeature = (feature: Feature) => (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) return next(new ApiError(401, "Authentication required"));

  if (user.role === "super_admin" || user.features.includes(feature)) return next();

  next(new ApiError(403, "You don't have permission to do this"));
};