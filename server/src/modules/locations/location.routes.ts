import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { dropdownLocationsSchema } from "./location.schema";
import { getLocationsController } from "./location.controller";
import { createLocationSchema, listLocationsSchema, updateLocationStatusSchema } from "./locationManage.schema";
import {
  createLocationController,
  listLocationsController,
  updateLocationStatusController,
} from "./locationManage.controller";

const router = Router();

router.use(authenticate);

// Filter dropdowns: active locations with brands, not paginated.
// Any signed-in user can call it, and the service only returns the platforms they may see.
router.get("/", validateQuery(dropdownLocationsSchema), getLocationsController);

// Management screen (Super Admin only): flat list with ids and status, paginated
router.get(
  "/list",
  requireFeature("manage_locations"),
  validateQuery(listLocationsSchema),
  listLocationsController
);

// Add a location (Super Admin only)
router.post("/", requireFeature("manage_locations"), validate(createLocationSchema), createLocationController);

// Disable or enable a location (Super Admin only)
router.patch(
  "/:id/status",
  requireFeature("manage_locations"),
  validate(updateLocationStatusSchema),
  updateLocationStatusController
);

export default router;