import {
  Router,
} from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

import {
  requireFeature,
} from "../../middlewares/role.middleware";

import {
  validateQuery,
} from "../../middlewares/validate.middleware";

import {
  listUploadsSchema,
} from "./upload.schema";

import {
  deleteUploadController,
  getUploadedFileController,
  listUploadsController,
} from "./uploadHistory.controller";

const router =
  Router();

// Mounted at:
// /api/uploads

// ------------------------------------------------------------
// LIST
// ------------------------------------------------------------

router.get(
  "/",
  authenticate,
  requireFeature("upload_data"),
  validateQuery(
    listUploadsSchema
  ),
  listUploadsController
);

// ------------------------------------------------------------
// FILE
//
// IMPORTANT:
// This route MUST appear before /:id
// ------------------------------------------------------------

router.get(
  "/:id/file",
  authenticate,
  requireFeature("upload_data"),
  getUploadedFileController
);

// ------------------------------------------------------------
// DELETE
//
// Super Admin only.
// ------------------------------------------------------------

router.delete(
  "/:id",
  authenticate,
  requireFeature("manage_users"),
  deleteUploadController
);

export default router;