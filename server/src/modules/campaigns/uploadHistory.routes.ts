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

/*
 * ============================================================
 * LIST UPLOADS
 * ============================================================
 */

router.get(
  "/",
  authenticate,
  requireFeature(
    "upload_data",
  ),
  validateQuery(
    listUploadsSchema,
  ),
  listUploadsController,
);

/*
 * ============================================================
 * GET FILE
 *
 * IMPORTANT:
 * Keep this BEFORE /:id
 * ============================================================
 */

router.get(
  "/:id/file",
  authenticate,
  requireFeature(
    "upload_data",
  ),
  getUploadedFileController,
);

/*
 * ============================================================
 * DELETE UPLOAD
 *
 * manage_users is intentionally
 * required here.
 *
 * This prevents normal upload users
 * from deleting campaign history.
 * ============================================================
 */

router.delete(
  "/:id",
  authenticate,
  requireFeature(
    "manage_users",
  ),
  deleteUploadController,
);

export default router;