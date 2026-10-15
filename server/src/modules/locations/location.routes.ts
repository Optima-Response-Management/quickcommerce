
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import {
  requireFeature,
  requireSuperAdmin,
} from "../../middlewares/role.middleware";
import {
  validate,
  validateQuery,
} from "../../middlewares/validate.middleware";

import { dropdownLocationsSchema } from "./location.schema";
import {
  createLocationSchema,
  listLocationsSchema,
  updateLocationStatusSchema,
} from "./locationManage.schema";

import { getLocationsController } from "./location.controller";
import {
  createLocationController,
  listLocationsController,
  updateLocationStatusController,
} from "./locationManage.controller";

const router = Router();

router.use(authenticate);

// Filter dropdown data, scoped to the user's permitted platforms.
router.get(
  "/",
  validateQuery(dropdownLocationsSchema),
  getLocationsController
);

// Management list is restricted to Super Admins.
router.get(
  "/list",
  requireSuperAdmin,
  validateQuery(listLocationsSchema),
  listLocationsController
);

router.post(
  "/",
  requireFeature("manage_locations"),
  validate(createLocationSchema),
  createLocationController
);

router.patch(
  "/:id/status",
  requireFeature("manage_locations"),
  validate(updateLocationStatusSchema),
  updateLocationStatusController
);

export default router;
