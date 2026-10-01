import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validate, validateQuery } from "../../middlewares/validate.middleware";
import { locationQuerySchema } from "./location.schema";
import { getLocationsController } from "./location.controller";
import { createLocationSchema, listLocationsSchema, updateLocationStatusSchema } from "./locationManage.schema";
import {
  createLocationController,
  listLocationsController,
  updateLocationStatusController,
} from "./locationManage.controller";

const router = Router();

// manage_locations is a Super Admin only feature (it can't be given to a user one by one)
router.use(authenticate, requireFeature("manage_locations"));    

// Active locations grouped by platform, state and city
router.get("/", validateQuery(locationQuerySchema), getLocationsController);

// Flat list with ids and status (disabled ones included), for the management screen
router.get("/list", validateQuery(listLocationsSchema), listLocationsController);

// Add a location
router.post("/", validate(createLocationSchema), createLocationController);

// Disable or enable a location
router.patch("/:id/status", validate(updateLocationStatusSchema), updateLocationStatusController);

export default router;