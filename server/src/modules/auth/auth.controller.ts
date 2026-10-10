
import { Request, Response, NextFunction } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import { env } from "../../config/env";
import { signIn } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite:
    env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
};

export async function signInController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, user } = await signIn(req.body);

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json(
      new ApiResponse("Authenticated", {
        user: authService.toSafeUser(req.user!),
      })
    );
  }
);

export function logoutController(
  _req: Request,
  res: Response
) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out" });
}
