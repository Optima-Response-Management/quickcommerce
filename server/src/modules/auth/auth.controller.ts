import type { Request, Response } from "express";

import { env } from "../../config/env";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const sessionCookieOptions = {
  ...cookieOptions,
  maxAge: 24 * 60 * 60 * 1000,
};
export const signInController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, user } = await authService.signIn(req.body);

    res.cookie("token", token, sessionCookieOptions);

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: { user },
    });
  },
);

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    res.status(200).json(
      new ApiResponse("Authenticated", {
        user: authService.toSafeUser(req.user),
      }),
    );
  },
);

export const logoutController = asyncHandler(
  async (_req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);