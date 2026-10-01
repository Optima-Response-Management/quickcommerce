import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validateQuery } from "../../middlewares/validate.middleware";
import { dashboardQuerySchema } from "./dashboard.schema";
import { dashboardSummaryController } from "./dashboard.controller";

const router = Router();

router.get(
  "/summary",
  authenticate,
  requireFeature("dashboard"),
  validateQuery(dashboardQuerySchema),
  dashboardSummaryController
);

export default router;