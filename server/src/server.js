import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const start = async () => {
  let isDbConnected = false;

  try {
    logger.info(`Startup configuration - NODE_ENV: ${process.env.NODE_ENV}, CLIENT_ORIGIN: "${process.env.CLIENT_ORIGIN}"`);
    await connectDb(env.mongoUri);
    isDbConnected = true;
    logger.info("Database connected successfully.");
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    logger.warn("Database connection failed in development. API will run in degraded mode.");
    logger.warn(err.message);
  }

  app.locals.isDbConnected = isDbConnected;
  app.listen(env.port, () => {
    logger.info(
      `Server running on port ${env.port}${isDbConnected ? "" : " (without database connection)"}`
    );
  });
};

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
