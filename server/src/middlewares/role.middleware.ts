import { NextFunction, Request, Response } from "express";
import { Feature } from "../config/contstants";
import { ApiError } from "../utils/ApiError";

// Use after `authenticate`.
// Super admins pass every feature check.
export const requireFeature =
  (feature: Feature) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (
      user.role === "super_admin" ||
      user.features.includes(feature)
    ) {
      return next();
    }

    next(new ApiError(403, "You don't have permission to do this"));
  };

/**
 * Super Admin only middleware.
 *
 * This is intentionally separate from requireFeature().
 * File History is not a grantable feature for admins/users.
 */
export const requireSuperAdmin =
  (
    req,
    _res,
    next,
  ) => {
    const user = req.user;

    if (!user) {
      return next(
        new ApiError(
          401,
          "Authentication required",
        ),
      );
    }

    if (
      user.role !==
      "super_admin"
    ) {
      return next(
        new ApiError(
          403,
          "Only Super Admins can access upload history",
        ),
      );
    }

    next();
  };