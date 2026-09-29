import { Router } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";

const router = Router();

router.get("/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json(new ApiResponse("API is running", { database: states[mongoose.connection.readyState] }));
});

// Later: router.use("/auth", authRoutes);

export default router;