
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";

import { env } from "../config/env";
import { User, type IUser } from "../modules/users/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export const authenticate = asyncHandler(
  async (req, _res, next) => {
    const cookieToken = req.cookies?.token;

    const authorizationHeader = req.headers.authorization;

    const bearerToken = authorizationHeader
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    const token = cookieToken || bearerToken;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    let payload: JwtPayload;

    try {
      const verified = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
      });

      if (
        typeof verified === "string" ||
        typeof verified.id !== "string" ||
        !verified.id
      ) {
        throw new Error("Invalid token payload");
      }

      payload = verified;
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(payload.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid or expired token");
    }

    req.user = user;

    next();
  },
);
