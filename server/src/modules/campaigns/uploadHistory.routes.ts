import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validateQuery } from "../../middlewares/validate.middleware";
import { listUploadsSchema } from "./upload.schema";
import { deleteUploadController, listUploadsController } from "./uploadHistory.controller";

const router = Router();

// Mounted at /api/campaigns/uploads

// Anyone who can upload can see the upload history (limited to their platforms)
router.get("/", authenticate, requireFeature("upload_data"), validateQuery(listUploadsSchema), listUploadsController);

// Deleting removes data the dashboards depend on, so it is Super Admin only
// (manage_users is a feature only Super Admins have)
router.delete("/:id", authenticate, requireFeature("manage_users"), deleteUploadController);

export default router;