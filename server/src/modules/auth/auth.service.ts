import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { User, IUser } from "../users/user.model";
import { SignInInput } from "./auth.schema";

export const toSafeUser = (user: HydratedDocument<IUser>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  platformAccess: user.platformAccess,
  platforms: user.platforms,
  features: user.features,
});

export async function signIn({ email, password, role }: SignInInput) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordOk = await bcrypt.compare(password, user.password);

  // Same generic error for wrong password or wrong role
  if (!passwordOk || user.role !== role) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact your administrator.");
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return { token, user: toSafeUser(user) };
}