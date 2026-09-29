import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB() {
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB error:", err.message));

  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}