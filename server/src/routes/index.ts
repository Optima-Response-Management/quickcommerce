import { Router } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.get("/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json(new ApiResponse("API is running", { database: states[mongoose.connection.readyState] }));
});

router.use("/auth", authRoutes);

export default router;