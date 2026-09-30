import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireFeature } from "../../middlewares/role.middleware";
import { validate, validateParams, validateQuery } from "../../middlewares/validate.middleware";
import { createUserSchema, listUsersSchema, updateAccessSchema, userIdParamSchema } from "./user.schema";
import {
  createUserController,
  deleteUserController,
  listUsersController,
  updateAccessController,
} from "./user.controller";

const router = Router();

router.use(authenticate, requireFeature("manage_users"));

router.post("/", validate(createUserSchema), createUserController);
router.get("/", validateQuery(listUsersSchema), listUsersController);
router.patch("/:id/access", validateParams(userIdParamSchema), validate(updateAccessSchema), updateAccessController);
router.delete("/:id", validateParams(userIdParamSchema), deleteUserController);

export default router;
