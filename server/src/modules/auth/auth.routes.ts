import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { signInLimiter } from "../../middlewares/rateLimiter.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { signInSchema } from "./auth.schema";
import { signInController, meController } from "./auth.controller";

const router = Router();

router.post("/signin", signInLimiter, validate(signInSchema), signInController);
router.get("/me", authenticate, meController);

export default router;