import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { signInLimiter } from "../../middlewares/rateLimiter.middleware";
import { signInSchema } from "./auth.schema";
import { signInController } from "./auth.controller";

const router = Router();

router.post("/signin", signInLimiter, validate(signInSchema), signInController);

export default router;