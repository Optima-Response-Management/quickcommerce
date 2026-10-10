
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

export async function signIn({
  email,
  password,
}: SignInInput) {
  console.info("[AUTH] Sign-in attempt received");

  // 1. Normalize the email and find the user.
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // 2. Reject unknown users.
  if (!user) {
    console.warn("[AUTH] Sign-in failed: user not found");
    throw new ApiError(401, "Invalid credentials");
  }

  console.info("[AUTH] User found");

  // 3. Compare the submitted password against the stored hash.
  const passwordOk = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordOk) {
    console.warn("[AUTH] Sign-in failed: password mismatch");
    throw new ApiError(401, "Invalid credentials");
  }

  console.info("[AUTH] Password validation successful");

  // 4. Reject inactive accounts.
  if (!user.isActive) {
    console.warn("[AUTH] Sign-in failed: account inactive");

    throw new ApiError(
      403,
      "Your account has been deactivated. Contact your administrator."
    );
  }

  console.info("[AUTH] Account is active");

  // 5. Update the last-login timestamp.
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: new Date(),
      },
    }
  );

  // 6. Generate the JWT.
  // If JWT configuration is invalid, the error will be handled
  // by the existing Express error handler.
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

  console.info("[AUTH] JWT generated successfully");

  // 7. Return the token and safe user data.
  // The controller sends the token through an HttpOnly cookie.
  return {
    token,
    user: toSafeUser(user),
  };
}
