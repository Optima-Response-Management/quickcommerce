import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { ListUploadsQuery } from "./upload.schema";
import { deleteUpload, listUploads } from "./uploadHistory.service";

export const listUploadsController = asyncHandler(async (req: Request, res: Response) => {
  const query = res.locals.query as ListUploadsQuery;
  const result = await listUploads(query, req.user!);
  res.status(200).json(new ApiResponse("Uploads fetched", result));
});

export const deleteUploadController = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteUpload(String(req.params.id));
  res.status(200).json(new ApiResponse("Upload deleted", result));
});