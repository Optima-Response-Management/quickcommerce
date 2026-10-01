import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { ListLocationsQuery } from "./locationManage.schema";
import { createLocation, listLocations, setLocationStatus } from "./locationManage.service";

export const listLocationsController = asyncHandler(async (_req: Request, res: Response) => {
  const result = await listLocations(res.locals.query as ListLocationsQuery);
  res.status(200).json(new ApiResponse("Locations fetched", result));
});

export const createLocationController = asyncHandler(async (req: Request, res: Response) => {
  const location = await createLocation(req.body);
  res.status(201).json(new ApiResponse("Location added", { location }));
});

export const updateLocationStatusController = asyncHandler(async (req: Request, res: Response) => {
  const location = await setLocationStatus(String(req.params.id), req.body.isActive);
  res.status(200).json(new ApiResponse(location.isActive ? "Location enabled" : "Location disabled", { location }));
});