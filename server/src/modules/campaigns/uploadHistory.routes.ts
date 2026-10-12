
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validateQuery } from "../../middlewares/validate.middleware";

import { listUploadsSchema } from "./upload.schema";

import {
  deleteUploadController,
  getUploadedFileController,
  listUploadsController,
} from "./uploadHistory.controller";

const router = Router();

// List upload history.
router.get(
  "/",
  authenticate,
  requireFeature("view_upload_history"),
  validateQuery(listUploadsSchema),
  listUploadsController,
);

// Keep this route before any generic /:id route.
router.get(
  "/:id/file",
  authenticate,
  requireFeature("view_upload_history"),
  getUploadedFileController,
);

// Deletion remains restricted to users with manage_users.
router.delete(
  "/:id",
  authenticate,
  requireFeature("manage_users"),
  deleteUploadController,
);

export default router;
