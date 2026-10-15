import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";

import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { User, type IUser } from "../users/user.model";
import type { SignInInput } from "./auth.schema";

export const toSafeUser = (
  user: HydratedDocument<IUser>,
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  platformAccess: user.platformAccess,
  platforms: user.platforms,
  features: user.features,
});

export async function signIn({
  email,
  password,
}: SignInInput) {
  console.info("[AUTH] Sign-in attempt received");

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    console.warn("[AUTH] Sign-in failed: user not found");
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordOk = await bcrypt.compare(
    password,
    user.password,
  );

  if (!passwordOk) {
    console.warn("[AUTH] Sign-in failed: password mismatch");
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    console.warn("[AUTH] Sign-in failed: account inactive");

    throw new ApiError(
      403,
      "Your account has been deactivated. Contact your administrator.",
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: new Date(),
      },
    },
  );

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
      algorithm: "HS256",
    },
  );

  console.info("[AUTH] Sign-in successful");

  return {
    token,
    user: toSafeUser(user),
  };
}