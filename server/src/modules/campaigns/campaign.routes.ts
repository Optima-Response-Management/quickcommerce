import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

import {
  requireFeature,
} from "../../middlewares/role.middleware";

import {
  uploadSingleFile,
} from "../../middlewares/upload.middleware";

import {
  validate,
  validateQuery,
} from "../../middlewares/validate.middleware";

import {
  listCampaignsSchema,
  uploadCampaignSchema,
} from "./campaign.schema";

import {
  listCampaignsController,
  uploadCampaignController,
  getCampaignFilterOptionsController,
} from "./campaign.controller";

const router = Router();

// ============================================================
// UPLOAD
// ============================================================

router.post(
  "/upload",
  authenticate,
  requireFeature("upload_data"),
  uploadSingleFile("file"),
  validate(
    uploadCampaignSchema,
  ),
  uploadCampaignController,
);

// ============================================================
// CAMPAIGN FILTER OPTIONS
//
// Must be before the generic campaign listing route.
// ============================================================

router.get(
  "/filter-options",
  authenticate,
  requireFeature("data_grid"),
  getCampaignFilterOptionsController,
);

// ============================================================
// DATA GRID
// ============================================================

router.get(
  "/",
  authenticate,
  requireFeature("data_grid"),
  validateQuery(
    listCampaignsSchema,
  ),
  listCampaignsController,
);

export default router;