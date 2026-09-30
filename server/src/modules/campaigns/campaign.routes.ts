import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { uploadSingleFile } from "../../middlewares/upload.middleware";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { listCampaignsSchema, uploadCampaignSchema } from "./campaign.schema";
import { listCampaignsController, uploadCampaignController } from "./campaign.controller";

const router = Router();

// Upload: sign-in, permission, read the file, validate the text fields, then the handler
router.post(
  "/upload",
  authenticate,
  requireFeature("upload_data"),
  uploadSingleFile("file"),
  validate(uploadCampaignSchema),
  uploadCampaignController
);

// Data grid: the uploaded campaign rows, with filters, search, sorting and pagination
router.get(
  "/",
  authenticate,
  requireFeature("data_grid"),
  validateQuery(listCampaignsSchema),
  listCampaignsController
);

export default router;