import { Router } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import authRoutes from "../modules/auth/auth.routes";
import platformRoutes from "../modules/platforms/platform.routes";
import campaignRoutes from "../modules/campaigns/campaign.routes";


const router = Router();

router.get("/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json(new ApiResponse("API is running", { database: states[mongoose.connection.readyState] }));
});

router.use("/auth", authRoutes);
router.use("/platforms", platformRoutes);
router.use("/campaigns", campaignRoutes);

export default router;