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

export async function signIn({ email, password }: SignInInput) {
  // 1. Find user by email
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  // 2. User doesn't exist
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 3. Compare plain password with hashed password
  const passwordOk = await bcrypt.compare(password, user.password);

  // 4. Password doesn't match
  if (!passwordOk) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 5. Check whether account is active
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been deactivated. Contact your administrator."
    );
  }

  // 6. Update last login
  await User.updateOne(
    { _id: user._id },
    {
      lastLoginAt: new Date(),
    }
  );

  // 7. Create JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    }
  );

  // 8. Return token + safe user data
  return {
    token,
    user: toSafeUser(user),
  };
}