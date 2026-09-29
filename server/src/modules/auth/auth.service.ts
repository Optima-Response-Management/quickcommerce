import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { User } from "../users/user.model";
import { SignInInput } from "./auth.schema";

// Used when the email doesn't exist, so the response takes the same time
// as a real password check and doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function signIn({ email, password, role }: SignInInput) {
  const user = await User.findOne({ email }).select("+password");

  const passwordOk = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  // One generic error for unknown email, wrong password, or wrong role
  if (!user || !passwordOk || user.role !== role) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact your administrator.");
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      platformAccess: user.platformAccess,
      platforms: user.platforms,
      features: user.features,
    },
  };
}