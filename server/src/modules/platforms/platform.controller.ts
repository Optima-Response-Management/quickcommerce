import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as platformService from "./platform.service";

export const listPlatformsController = asyncHandler(async (_req: Request, res: Response) => {
  const platforms = await platformService.listPlatforms();
  res.status(200).json(new ApiResponse("Platforms fetched", { platforms }));
});