import { Router } from "express";
import mongoose from "mongoose";

import { ApiResponse } from "../utils/ApiResponse";

import authRoutes from "../modules/auth/auth.routes";
import platformRoutes from "../modules/platforms/platform.routes";
import campaignRoutes from "../modules/campaigns/campaign.routes";
import userRoutes from "../modules/users/user.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import uploadHistoryRoutes from "../modules/campaigns/uploadHistory.routes";
import locationRoutes from "../modules/locations/location.routes";

const router = Router();

router.get("/health", (_req, res) => {
  const states = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ];

  res.json(
    new ApiResponse("API is running", {
      database:
        states[mongoose.connection.readyState] ??
        "unknown",
    }),
  );
});

router.use("/auth", authRoutes);
router.use("/platforms", platformRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadHistoryRoutes);
router.use("/locations", locationRoutes);

export default router;