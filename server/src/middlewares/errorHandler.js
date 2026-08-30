import { logger } from "../utils/logger.js";

export const notFound = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const summary = `${req.method} ${req.originalUrl} -> ${status} ${message}`;
  
  logger.error(summary, {
    status,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack
  });

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
