import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { LocationQuery } from "./location.schema";
import { getLocations } from "./location.service";

export const getLocationsController = asyncHandler(async (req: Request, res: Response) => {
  const query = res.locals.query as LocationQuery;
  const result = await getLocations(query, req.user!);
  res.status(200).json(new ApiResponse("Locations fetched", result));
});