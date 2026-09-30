import jwt, { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User, IUser } from "../modules/users/user.model";

// Adds req.user to Express's Request type
declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  // Load the user from the database on every request, so removed access
  // or a deactivated account takes effect immediately
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid or expired token");
  }

  req.user = user;
  next();
});