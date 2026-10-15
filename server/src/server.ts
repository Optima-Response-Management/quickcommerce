import app from "./app";
import { env } from "./config/env";
import {
  connectDB,
  disconnectDB,
} from "./config/db";
import { logger } from "./utils/logger";

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(
      `Server running on port ${env.PORT} (${env.NODE_ENV})`,
    );
  });

  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    logger.info(`${signal} received, shutting down`);

    server.close(async (error) => {
      try {
        await disconnectDB();

        if (error) {
          logger.error("HTTP server shutdown failed:", error);
          process.exitCode = 1;
        }
      } catch (shutdownError) {
        logger.error(
          "Database disconnection failed:",
          shutdownError,
        );

        process.exitCode = 1;
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err: unknown) => {
  logger.error("Startup failed:", err);
  process.exitCode = 1;
});