import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

// Frontend (qcom.optimaresponse.com) and API (onrender.com) are different
// sites, so the cookie must be SameSite=None, and None requires Secure.
// If the API moves to api.optimaresponse.com, change this to "lax".
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const FALLBACK_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Keep the cookie lifetime identical to the JWT lifetime so changing
 * JWT_EXPIRES_IN can never leave a live cookie holding a dead token.
 */
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

export const signInController = asyncHandler(
  async (req: Request, res: Response) => {
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
    // Attributes must match the ones used when the cookie was set.
    res.clearCookie("token", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);