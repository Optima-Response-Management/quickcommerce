import app from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { logger } from "./utils/logger";

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error("Startup failed:", err.message);
  process.exit(1);
});