import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { listPlatformsController } from "./platform.controller";

const router = Router();

router.get("/", authenticate, listPlatformsController);

export default router;