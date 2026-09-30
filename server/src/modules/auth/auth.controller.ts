import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";

export const signInController = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse("Signed in successfully", result));
});
export const meController = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse("Authenticated", { user: authService.toSafeUser(req.user!) }));
});