
import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

const isProduction = env.NODE_ENV === "production";

// SameSite=None requires Secure cookies.
// This supports cross-origin frontend requests when the browser permits
// third-party cookies.
const sameSite: CookieOptions["sameSite"] = "none";
const secure = isProduction || sameSite === "none";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  path: "/",
  ...(env.COOKIE_DOMAIN
    ? { domain: env.COOKIE_DOMAIN }
    : {}),
};

const FALLBACK_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getCookieMaxAge(token: string): number {
  const decoded = jwt.decode(token);

  if (
    decoded &&
    typeof decoded === "object" &&
    typeof decoded.exp === "number"
  ) {
    const remaining = decoded.exp * 1000 - Date.now();

    if (remaining > 0) {
      return remaining;
    }
  }

  return FALLBACK_MAX_AGE_MS;
}

function setNoCacheHeaders(res: Response): void {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });
}

export const signInController = asyncHandler(
  async (req: Request, res: Response) => {
    setNoCacheHeaders(res);

    const { token, user } = await authService.signIn(req.body);

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: getCookieMaxAge(token),
    });

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: { user },
    });
  },
);

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    setNoCacheHeaders(res);

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
    setNoCacheHeaders(res);

    // Use the same cookie attributes as sign-in when clearing the cookie.
    res.clearCookie("token", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);
